import type { Device, VPNProtocol } from '@prisma/client';
import type { InlineKeyboardButton, Message, SendBasicOptions } from 'node-telegram-bot-api';
import { basename } from 'path';
import { formatDate } from '../../core';
import bot from '../../core/bot';
import { createUserOperationsKeyboard, getUserContactKeyboard, skipKeyboard } from '../../core/buttons';
import { CommandScope, UserRequest, VPNUserCommand } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import logger from '../../core/logger';
import pollOptions from '../../core/pollOptions';
import env from '../../env';
import { exportToSheet } from './sheets.service';
import type { UsersContext } from './users.handler';
import { UsersRepository, type VPNUser } from './users.repository';

export class UsersService {
	constructor(private repository: UsersRepository) {}

	private state = {
		params: new Map(),
		createSteps: {
			telegramId: false,
			username: false,
			firstName: false,
			lastName: false,
			telegramLink: false,
			devices: false,
			protocols: false,
		},
	};
	private textProps = ['telegramLink', 'firstName', 'lastName', 'username'];

	async create(
		message: Message,
		context: UsersContext,
		start = false,
		selectedOptions: (Device | VPNProtocol)[] = [],
	) {
		this.log(`create. Active step ${this.getActiveStep(this.state.createSteps) ?? 'start'}`);

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
		if (this.state.createSteps.telegramId) {
			if (message?.user_shared) {
				this.state.params.set('telegram_id', message.user_shared.user_id.toString());
			}
			await bot.sendMessage(chatId, 'Enter new username');
			this.setCreateStep('username');
			return;
		}
		if (this.state.createSteps.username) {
			this.state.params.set('username', message.text);
			await bot.sendMessage(chatId, 'Enter first name');
			this.setCreateStep('firstName');
			return;
		}
		if (this.state.createSteps.firstName) {
			this.state.params.set('first_name', message.text);
			await bot.sendMessage(chatId, 'Enter last name', skipKeyboard);
			this.setCreateStep('lastName');
			return;
		}
		if (this.state.createSteps.lastName) {
			if (!context.skip) {
				this.state.params.set('last_name', message.text);
			}
			await bot.sendMessage(chatId, 'Enter telegram link', skipKeyboard);
			this.setCreateStep('telegramLink');
			return;
		}
		if (this.state.createSteps.telegramLink) {
			if (!context.skip) {
				this.state.params.set('telegram_link', message.text);
			}
			await bot.sendPoll(chatId, 'Choose devices', pollOptions.devices, {
				allows_multiple_answers: true,
			});
			this.setCreateStep('devices');
			return;
		}
		if (this.state.createSteps.devices) {
			this.state.params.set('devices', selectedOptions);
			await bot.sendPoll(chatId, 'Choose protocols', pollOptions.protocols, {
				allows_multiple_answers: true,
			});
			this.setCreateStep('protocols');
			return;
		}
		if (this.state.createSteps.protocols) {
			this.state.params.set('protocols', selectedOptions);
		}
		const params = this.state.params;
		const username = params.get('username');
		try {
			const result = await this.repository.create(
				username,
				params.get('first_name'),
				params.get('telegram_id'),
				params.get('telegram_link'),
				params.get('last_name'),
				params.get('devices'),
				params.get('protocols'),
			);
			await bot.sendMessage(
				chatId,
				`User successfully created 
id: ${result.id}				
Username: ${result.username} 
First name: ${result.firstName}`,
			);
		} catch (error) {
			logger.error(
				`[${basename(__filename)}]: Unexpected error occurred while creating user ${username}: ${error}`,
			);
			await bot.sendMessage(chatId, `Unexpected error occurred while creating user ${username}: ${error}`);
		} finally {
			this.state.params.clear();
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
					s: CommandScope.Users,
					c: {
						cmd: VPNUserCommand.GetById,
						id,
					},
					p: 1,
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
		selectedOptions: (Device | VPNProtocol)[] = [],
	) {
		this.log('update');
		const textProp = this.textProps.includes(context.prop);
		if (state.init) {
			this.initUpdate(message, context);
			state.init = false;
			return;
		}
		if (selectedOptions.length) {
			const updated = await this.repository.update(Number(context.id), {
				[context.prop]: selectedOptions,
			});
			logger.success(`Field ${context.prop} has been successfully updated for user ${context.id}`);
			await bot.sendMessage(context.chatId, this.formatUserInfo(updated));
			globalHandler.finishCommand();
			return;
		}
		if (context.prop === 'payerId') {
			const updateId = this.state.params.get('updateId');
			const updated = await this.repository.update(updateId, {
				payerId: context.id,
			});
			logger.success(`Payer has been successfully set to ${context.id} for user ${updateId}`);
			await bot.sendMessage(context.chatId, this.formatUserInfo(updated));
			this.state.params.clear();
			globalHandler.finishCommand();
			return;
		}
		const updateDto = {
			[context.prop]: textProp ? message.text : message.user_shared.user_id.toString(),
		};
		if (updateDto.price) {
			updateDto.price = Number(updateDto.price);
		}
		const updated = await this.repository.update(Number(context.id), updateDto);
		logger.success(`User info has been successfully updated for user ${context.id}`);
		await bot.sendMessage(message.chat.id, this.formatUserInfo(updated));
		globalHandler.finishCommand();
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
					s: CommandScope.Users,
					c: {
						cmd: VPNUserCommand.Delete,
						id,
					},
					p: 1,
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

	async sync(message: Message) {
		this.log('sync');
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
		this.log('upaid');
		const users = await this.repository.getUnpaidUsers();
		for (const user of users) {
			if (user.payments.length) {
				const lastPayment = user.payments[0];
				await bot.sendMessage(
					message.chat.id,
					`User ${user.username} last payment UUID ${lastPayment.id}
	Payment Date: ${formatDate(lastPayment.paymentDate)}
	Months count: ${lastPayment.monthsCount}
	Expires on: ${formatDate(lastPayment.expiresOn)}
	Amount: ${lastPayment.amount}`,
				);
			}
		}
		if (users.length) {
			await bot.sendMessage(
				message.chat.id,
				`Users 
${users.map(u => u.username).join('\n')} 
have no payments for next month.`,
			);
		}
		globalHandler.finishCommand();
	}

	private setCreateStep(current: string) {
		this.setActiveStep(current, this.state.createSteps);
	}

	private setActiveStep(current: string, steps) {
		Object.keys(steps).forEach(k => {
			steps[k] = false;
			steps[current] = true;
		});
	}

	private async initUpdate(message: Message, context: UsersContext) {
		const textProp = this.textProps.includes(context.prop);
		if (textProp) {
			await bot.sendMessage(message.chat.id, `Enter ${context.prop}`);
		} else if (context.prop === 'telegramId') {
			await bot.sendMessage(message.chat.id, 'Share user:', {
				reply_markup: getUserContactKeyboard(UserRequest.Update),
			});
		} else if (context.prop === 'payerId') {
			this.state.params.set('updateId', context.id);
			await this.getPossiblePayers(message);
		} else {
			await bot.sendPoll(message.chat.id, `Select ${context.prop}`, pollOptions[context.prop], {
				allows_multiple_answers: true,
			});
		}
	}

	private async getPossiblePayers(message: Message) {
		const users = await this.repository.payersList();
		const chunkSize = 50;
		const buttons = users
			.map(({ id, username, firstName, lastName }) => [
				{
					text: `${username} (${firstName ?? ''} ${lastName ?? ''})`,
					callback_data: JSON.stringify({
						s: CommandScope.Users,
						c: {
							cmd: VPNUserCommand.Update,
							id,
							prop: 'payerId',
						},
						p: 1,
					}),
				} as InlineKeyboardButton,
			])
			.concat([
				[
					{
						text: 'Set null',
						callback_data: JSON.stringify({
							s: CommandScope.Users,
							c: {
								cmd: VPNUserCommand.Update,
								id: null,
								prop: 'payerId',
							},
							p: 1,
						}),
					},
				],
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

	private getActiveStep(steps) {
		const result = Object.keys(steps).filter(k => steps[k]);
		if (result.length) {
			return result[0];
		}
		return null;
	}

	private resetCreateSteps() {
		Object.keys(this.state.createSteps).forEach(k => {
			this.state.createSteps[k] = false;
		});
	}

	private async sendUserMenu(chatId: number, user: VPNUser) {
		await bot.sendMessage(chatId, this.formatUserInfo(user));
		await bot.sendMessage(chatId, 'Select operation', {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Update',
							callback_data: JSON.stringify({
								s: CommandScope.Users,
								c: {
									cmd: VPNUserCommand.Expand,
									id: user.id,
									subo: VPNUserCommand.Update,
								},
							}),
						},
						{
							text: 'Payments',
							callback_data: JSON.stringify({
								s: CommandScope.Users,
								c: {
									cmd: VPNUserCommand.ShowPayments,
									id: user.id,
								},
							}),
						},
						{
							text: 'Pay',
							callback_data: JSON.stringify({
								s: CommandScope.Users,
								c: {
									cmd: VPNUserCommand.Pay,
									id: user.id,
								},
							}),
						},
					],
				],
			},
		});
	}

	private formatUserInfo(user: VPNUser) {
		return `
id: ${user.id}
username: ${user.username}
First Name: ${user.firstName}
Last Name: ${user.lastName}
Telegram Link: ${user.telegramLink}
Telegram Id: ${user.telegramId}
Devices: ${user.devices.join(', ')}
Protocols: ${user.protocols.join(', ')}
Price: ${user.price}
Created At: ${formatDate(user.createdAt)}
${user.payer?.username ? 'Payer: ' + user.payer?.username : ''}${user.dependants?.length ? 'Dependants: ' + user.dependants?.map(u => u.username).join(', ') : ''}
		`;
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
}
