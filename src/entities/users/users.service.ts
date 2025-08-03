import type { Device, User, VPNProtocol } from '@prisma/client';
import type { InlineKeyboardButton, Message, SendBasicOptions } from 'node-telegram-bot-api';
import { basename } from 'path';
import { formatDate, setActiveStep } from '../../core';
import bot from '../../core/bot';
import {
	createUserOperationsKeyboard,
	getUserContactKeyboard,
	getUserMenu,
	payersKeyboard,
	skipKeyboard,
} from '../../core/buttons';
import { Bank, BoolFieldState, CmdCode, CommandScope, UserRequest, VPNUserCommand } from '../../core/enums';
import { globalHandler } from '../../core/global.handler';
import logger from '../../core/logger';
import pollOptions from '../../core/pollOptions';
import env from '../../env';
import { exportToSheet } from './sheets.service';
import type { UsersContext } from './users.handler';
import { UsersRepository, type VPNUser } from './users.repository';
import { PaymentsRepository } from '../payments/payments.repository';

export class UsersService {
	constructor(private repository: UsersRepository = new UsersRepository()) {}

	params = new Map();
	createSteps = {
		telegramId: false,
		username: false,
		firstName: false,
		lastName: false,
		telegramLink: false,
		devices: false,
		protocols: false,
		bank: false,
	};
	updateSteps = {
		payerSearch: false,
		apply: false,
	};
	private textProps = ['telegramLink', 'firstName', 'lastName', 'username'];
	private boolProps = ['active', 'free'];
	private numberProps = ['price'];

	async create(
		message: Message,
		context: UsersContext,
		start = false,
		selectedOptions: (Device | VPNProtocol | Bank)[] = [],
	) {
		this.log(`create. Active step ${this.getActiveStep(this.createSteps) ?? 'start'}`);

		const chatId = message ? message.chat.id : context.chatId;
		if (start) {
			await bot.sendMessage(message.chat.id, 'Share user. For skipping just send any text', {
				reply_markup: {
					keyboard: [
						[
							{
								text: 'Share contact',
								request_user: {
									request_id: UserRequest.Create,
								},
							},
						],
					],
					one_time_keyboard: true, // The keyboard will hide after one use
					resize_keyboard: true, // Fit the keyboard to the screen size
				},
			});
			this.setCreateStep('telegramId');
			return;
		}
		if (this.createSteps.telegramId) {
			if (message?.user_shared) {
				this.params.set('telegram_id', message.user_shared.user_id.toString());
			}
			await bot.sendMessage(chatId, 'Enter new username');
			this.setCreateStep('username');
			return;
		}
		if (this.createSteps.username) {
			this.params.set('username', message.text);
			await bot.sendMessage(chatId, 'Enter first name');
			this.setCreateStep('firstName');
			return;
		}
		if (this.createSteps.firstName) {
			this.params.set('first_name', message.text);
			await bot.sendMessage(chatId, 'Enter last name', skipKeyboard);
			this.setCreateStep('lastName');
			return;
		}
		if (this.createSteps.lastName) {
			if (!context.skip) {
				this.params.set('last_name', message.text);
			}
			await bot.sendMessage(chatId, 'Enter telegram link', skipKeyboard);
			this.setCreateStep('telegramLink');
			return;
		}
		if (this.createSteps.telegramLink) {
			if (!context.skip) {
				this.params.set('telegram_link', message.text);
			}
			await bot.sendPoll(chatId, 'Choose devices', pollOptions.devices, {
				allows_multiple_answers: true,
			});
			await bot.sendMessage(chatId, 'Skip', skipKeyboard);
			this.setCreateStep('devices');
			return;
		}
		if (this.createSteps.devices) {
			if (!context.skip) {
				this.params.set('devices', selectedOptions);
			}
			await bot.sendPoll(chatId, 'Choose protocols', pollOptions.protocols, {
				allows_multiple_answers: true,
			});
			await bot.sendMessage(chatId, 'Skip', skipKeyboard);
			this.setCreateStep('protocols');
			return;
		}
		if (this.createSteps.protocols) {
			if (!context.skip) {
				this.params.set('protocols', selectedOptions);
			}
			await bot.sendPoll(chatId, 'Choose bank', pollOptions.bank, {
				allows_multiple_answers: false,
			});
			await bot.sendMessage(chatId, 'Skip', skipKeyboard);
			this.setCreateStep('bank');
			return;
		}
		if (this.createSteps.bank) {
			if (!context.skip) {
				this.params.set('bank', selectedOptions[0]);
			}
		}
		const params = this.params;
		const username = params.get('username');
		try {
			const newUser = await this.repository.create(
				username,
				params.get('first_name'),
				params.get('telegram_id'),
				params.get('telegram_link'),
				params.get('last_name'),
				params.get('devices'),
				params.get('protocols'),
				params.get('bank'),
			);
			await bot.sendMessage(chatId, `User ${newUser.username} has been successfully created`);
			await this.sendUserMenu(chatId, newUser);
		} catch (error) {
			logger.error(
				`[${basename(__filename)}]: Unexpected error occurred while creating user ${username}: ${error}`,
			);
			await bot.sendMessage(chatId, `Unexpected error occurred while creating user ${username}: ${error}`);
		} finally {
			this.params.clear();
			this.resetCreateSteps();
			globalHandler.finishCommand();
		}
	}

	async list(message: Message) {
		this.log('list');
		const users = await this.repository.list();
		const chunkSize = 50;
		const buttons = users.map(({ id, username, firstName, lastName }) => [
			{
				text: `${username} (${firstName ?? ''} ${lastName ?? ''})`,
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Users,
					[CmdCode.Context]: {
						cmd: VPNUserCommand.GetById,
						id,
					},
					[CmdCode.Processing]: 1,
				}),
			} as InlineKeyboardButton,
		]);
		const chunksCount = Math.ceil(buttons.length / chunkSize);
		for (let i = 0; i < chunksCount; i++) {
			const chunk = buttons.slice(i * chunkSize, i * chunkSize + chunkSize);
			const inlineKeyboard: SendBasicOptions = {
				reply_markup: {
					inline_keyboard: [...chunk],
				},
			};
			await bot.sendMessage(message.chat.id, `Select user (part ${i + 1}):`, inlineKeyboard);
		}

		await bot.sendMessage(message.chat.id, `Total count ${users.length}`);
	}

	async findByFirstName(message: Message, start: boolean) {
		this.log('findByFirstName');
		if (!start) {
			const users = await this.repository.findByFirstName(message.text);
			if (!users.length) {
				await bot.sendMessage(message.chat.id, `No users found in system with first name ${message.text}`);
			}
			for (const user of users) {
				await this.sendUserMenu(message.chat.id, user);
			}
		}
		await bot.sendMessage(message.chat.id, 'Enter first name');
	}

	async findByUsername(message: Message, start: boolean) {
		this.log('findByUsername');

		if (!start) {
			const users = await this.repository.findByUsername(message.text);
			if (!users.length) {
				await bot.sendMessage(message.chat.id, `No users found in system with username ${message.text}`);
			}
			for (const user of users) {
				await this.sendUserMenu(message.chat.id, user);
			}
			globalHandler.finishCommand();
			return;
		}
		await bot.sendMessage(message.chat.id, 'Enter username');
	}

	async getByTelegramId(message: Message, start: boolean) {
		this.log('getByTelegramId');
		if (!start) {
			if (message?.user_shared) {
				const user = await this.repository.getByTelegramId(message?.user_shared?.user_id?.toString());
				if (user) {
					await this.sendUserMenu(message.chat.id, user);
				} else {
					await bot.sendMessage(message.chat.id, 'User not found in system');
				}
			} else {
				await bot.sendMessage(message.chat.id, 'You did not sent any telegram contact');
			}
			globalHandler.finishCommand();
			return;
		}
		await bot.sendMessage(message.chat.id, 'Share user', {
			reply_markup: {
				keyboard: [
					[
						{
							text: 'Share contact',
							request_user: {
								request_id: UserRequest.Get,
							},
						},
					],
				],
				one_time_keyboard: true, // The keyboard will hide after one use
				resize_keyboard: true, // Fit the keyboard to the screen size
			},
		});
	}

	async getById(message: Message, context: UsersContext) {
		this.log('getById');
		const user = await this.repository.getById(Number(context.id));
		await this.sendUserMenu(message.chat.id, user);
		globalHandler.finishCommand();
	}

	async expand(message: Message, context: UsersContext) {
		await bot.sendMessage(
			message.chat.id,
			'Select field to update',
			createUserOperationsKeyboard(Number(context.id)),
		);

		globalHandler.finishCommand();
	}

	async update(
		message: Message,
		context: UsersContext,
		state: { init: boolean },
		selectedOptions: (Device | VPNProtocol | Bank | BoolFieldState)[] = [],
	) {
		this.log('update');
		const textProp = this.textProps.includes(context.prop);
		const boolProp = this.boolProps.includes(context.prop);
		const numberProp = this.numberProps.includes(context.prop);
		if (state.init) {
			this.initUpdate(message, context);
			state.init = false;
			return;
		}
		if (boolProp) {
			const value = selectedOptions[0] === 'true';
			await this.applyUpdate(context.chatId, Number(context.id), context.prop, value);
			return;
		}
		if (selectedOptions.length) {
			let value: string | boolean | string[];
			if (context.prop === 'bank') {
				value = selectedOptions[0];
			} else if (boolProp) {
				value = selectedOptions[0] === 'true';
			} else {
				value = selectedOptions;
			}
			await this.applyUpdate(context.chatId, Number(context.id), context.prop, value);
			return;
		}
		if (context.prop === 'payerId') {
			if (context.id === null) {
				this.setUpdateStep('apply');
			}
			if (this.updateSteps.payerSearch) {
				this.getPossiblePayers(message, context, this.params.get('updateId'));
				this.setUpdateStep('apply');
				return;
			}
			const updateId = this.params.get('updateId');
			try {
				const updated = await this.repository.update(updateId, {
					payerId: context.id,
				});
				logger.success(`Payer has been successfully set to ${context.id} for user ${updateId}`);
				await this.sendUserMenu(message.chat.id, updated);
			} catch (error) {
				const errorMessage = `Error while updating payerId ${error}`;
				logger.error(errorMessage);
				await bot.sendMessage(message.chat.id, errorMessage);
			} finally {
				this.params.clear();
				globalHandler.finishCommand();
			}
			return;
		}
		const newValue = textProp
			? message.text
			: numberProp
				? Number(message.text)
				: message.user_shared.user_id.toString();
		this.applyUpdate(message.chat.id, Number(context.id), context.prop, newValue);
	}

	async delete(msg: Message, context: UsersContext, start: boolean) {
		this.log('delete');
		if (!start) {
			await this.repository.delete(Number(context.id));
			const message = `User with id ${context.id} has been successfully removed`;
			logger.success(`[${basename(__filename)}]: ${message}`);
			await bot.sendMessage(msg.chat.id, message);
			globalHandler.finishCommand();
			return;
		}
		const users = await this.repository.list();
		const buttons = users.map(({ username, id }) => [
			{
				text: username,
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Users,
					[CmdCode.Context]: {
						cmd: VPNUserCommand.Delete,
						id,
					},
					[CmdCode.Processing]: 1,
				}),
			},
		]);
		const inlineKeyboard = {
			reply_markup: {
				inline_keyboard: [...buttons],
			},
		};
		await bot.sendMessage(msg.chat.id, 'Select user to delete:', inlineKeyboard);
	}

	async exportPayments(message: Message) {
		this.log('exportPayments');

		const paymentsData = await new PaymentsRepository().getAllForSheet();
		const preparedPaymentsData = paymentsData.map(row => {
			return [
				row.id ?? '',
				row.user.username ?? '',
				row.user.firstName ?? '',
				row.user.lastName ?? '',
				row.amount ?? 0,
				row.paymentDate ? new Date(row.paymentDate).toLocaleString('ru-RU', { timeZone: 'UTC' }) : '',
				row.expiresOn ? new Date(row.expiresOn).toLocaleString('ru-RU', { timeZone: 'UTC' }) : '',
				row.monthsCount ?? 0,
				row.plan?.name ?? '',
				row.parentPaymentId ?? '',
			];
		});
		try {
			await exportToSheet(env.SHEET_ID, 'Payments!A2', preparedPaymentsData);
			logger.success(`${basename(__filename)}}: Users payments data successfully exported to Google Sheets!`);
			await bot.sendMessage(message.chat.id, '✅ Users payments data successfully exported to Google Sheets!');
		} catch (error) {
			logger.error(`[${basename(__filename)}]: Users payments sync process finished with error: ${error}`);
			await bot.sendMessage(message.chat.id, `❌ Users payments sync process finished with error: ${error}`);
		}
	}

	async export(message: Message) {
		this.log('export');
		const data = await this.repository.list();
		const preparedData = data.map(row => {
			return [
				row.firstName ?? '',
				row.lastName ?? '',
				row.username ?? '',
				row.telegramId ?? '',
				row.telegramLink ?? '',
				row.id ? row.id.toString() : '',
				row.price ? row.price.toString() : '',
				row.devices?.length ? row.devices.join(', ') : '',
				row.protocols?.length ? row.protocols.join(', ') : '',
				row.createdAt ? new Date(row.createdAt).toLocaleString('ru-RU', { timeZone: 'UTC' }) : '',
				row.free ? true : false,
			];
		});

		try {
			await exportToSheet(env.SHEET_ID, 'Users!A2', preparedData);
			logger.success(`${basename(__filename)}}: Users data successfully exported to Google Sheets!`);
			await bot.sendMessage(message.chat.id, '✅ Users data successfully exported to Google Sheets!');
		} catch (error) {
			logger.error(`[${basename(__filename)}]: Users sync process finished with error: ${error}`);
			await bot.sendMessage(message.chat.id, `❌ Users sync process finished with error: ${error}`);
		}
	}

	async showUnpaid(message: Message) {
		this.log('unpaid');
		const users = await this.repository.getUnpaidUsers();
		for (const user of users) {
			if (user.payments.length) {
				const lastPayment = user.payments[0];
				await bot.sendMessage(
					message.chat.id,
					`User ${user.username.replace(/[-.*#_]/g, match => `\\${match}`)} \\(ID ${user.id}\\) last payment UUID \`${lastPayment.id}\`
	Payment Date: ${formatDate(lastPayment.paymentDate).replace(/[-.*#_]/g, match => `\\${match}`)}
	Months count: ${lastPayment.monthsCount}
	Expires on: ${formatDate(lastPayment.expiresOn).replace(/[-.*#_]/g, match => `\\${match}`)}
	Amount: ${lastPayment.amount}`,
					{
						parse_mode: 'MarkdownV2',
					},
				);
				await bot.sendMessage(message.chat.id, 'Possible operations with user', {
					reply_markup: {
						inline_keyboard: getUserMenu(user.id),
					},
				});
			}
		}
		if (users.length) {
			await bot.sendMessage(
				message.chat.id,
				`Users 
${users.map(u => `${u.username} ${u.telegramLink ?? ''}`).join('\n')} 
have no payments for next month.`,
			);
		}
		globalHandler.finishCommand();
	}

	private setCreateStep(current: string) {
		setActiveStep(current, this.createSteps);
	}

	private setUpdateStep(current: string) {
		setActiveStep(current, this.updateSteps);
	}

	private async initUpdate(message: Message, context: UsersContext) {
		const textProp = this.textProps.includes(context.prop);
		const boolProp = this.boolProps.includes(context.prop);
		const numberProp = this.numberProps.includes(context.prop);
		if (textProp || numberProp) {
			await bot.sendMessage(message.chat.id, `Enter ${context.prop}`);
		} else if (context.prop === 'telegramId') {
			await bot.sendMessage(message.chat.id, 'Share user:', {
				reply_markup: getUserContactKeyboard(UserRequest.Update),
			});
		} else if (boolProp) {
			await bot.sendPoll(message.chat.id, `Choose new state`, pollOptions.boolFieldState, {
				allows_multiple_answers: false,
			});
		} else if (context.prop === 'payerId') {
			this.params.set('updateId', context.id);
			await bot.sendMessage(
				message.chat.id,
				'Send start of username for user searching or click on the button to show all users',
				payersKeyboard,
			);
			this.setUpdateStep('payerSearch');
		} else {
			await bot.sendPoll(message.chat.id, `Select ${context.prop}`, pollOptions[context.prop], {
				allows_multiple_answers: context.prop !== 'bank',
			});
		}
	}

	private async getPossiblePayers(message: Message, context: UsersContext, userId: string) {
		const possibleUsers = await this.repository.payersList(Number(userId));
		const users = context.accept ? possibleUsers : possibleUsers.filter(u => u.username.startsWith(message.text));
		const buttons = users.map(({ id, username, firstName, lastName }) => [
			{
				text: `${username} (${firstName ?? ''} ${lastName ?? ''})`,
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Users,
					[CmdCode.Context]: {
						[CmdCode.Command]: VPNUserCommand.Update,
						id,
						prop: 'payerId',
					},
					[CmdCode.Processing]: 1,
				}),
			} as InlineKeyboardButton,
		]);
		const chunkSize = 50;
		const chunksCount = Math.ceil(buttons.length / chunkSize);
		for (let i = 0; i < chunksCount; i++) {
			const chunk = buttons.slice(i * chunkSize, i * chunkSize + chunkSize);
			const inlineKeyboard: SendBasicOptions = {
				reply_markup: {
					inline_keyboard: [...chunk],
				},
			};
			await bot.sendMessage(message.chat.id, `Select user (part ${i + 1}):`, inlineKeyboard);
		}

		await bot.sendMessage(message.chat.id, `Total count ${users.length}`);
	}

	private async applyUpdate(chatId: number, id: number, prop: string, value: string[] | number | string | boolean) {
		const updated = await this.repository.update(id, {
			[prop]: value,
		});
		logger.success(`Field ${prop} has been successfully updated for user ${id}`);
		await bot.sendMessage(chatId, this.formatUserInfo(updated));
		this.params.clear();
		globalHandler.finishCommand();
		return;
	}

	private getActiveStep(steps) {
		const result = Object.keys(steps).filter(k => steps[k]);
		if (result.length) {
			return result[0];
		}
		return null;
	}

	private resetCreateSteps() {
		Object.keys(this.createSteps).forEach(k => {
			this.createSteps[k] = false;
		});
	}

	private async sendUserMenu(chatId: number, user: User | VPNUser) {
		await bot.sendMessage(chatId, this.formatUserInfo(user));
		await bot.sendMessage(chatId, 'Select operation', {
			reply_markup: {
				inline_keyboard: getUserMenu(user.id),
			},
		});
	}

	private formatUserInfo(user: VPNUser | User) {
		return `
ID: ${user.id}
Username: ${user.username}
First Name: ${user.firstName}
Last Name: ${user.lastName}
Telegram Link: ${user.telegramLink}
Telegram Id: ${user.telegramId}
Devices: ${user.devices.join(', ')}
Protocols: ${user.protocols.join(', ')}
Price: ${user.price}
Created At: ${formatDate(user.createdAt)}
${user.bank ? 'Bank: ' + user.bank : ''}
${user.free ? 'Is free' : ''}
${user.payer?.username ? 'Payer: ' + user.payer?.username : ''}${user.dependants?.length ? 'Dependants: ' + user.dependants?.map(u => u.username).join(', ') : ''}
${user.active ? '' : 'Inactive'}
		`;
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
}

export const usersService = new UsersService();
