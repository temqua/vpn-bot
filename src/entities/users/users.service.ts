import type { Device, VPNProtocol } from '@prisma/client';
import { addMonths, format } from 'date-fns';
import type { InlineKeyboardButton, Message, SendBasicOptions } from 'node-telegram-bot-api';
import { basename } from 'path';
import bot from '../../core/bot';
import { acceptKeyboard, createUserOperationsKeyboard, getUserContactKeyboard, skipKeyboard } from '../../core/buttons';
import { CommandScope, UserRequest, VPNUserCommand } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import logger from '../../core/logger';
import pollOptions from '../../core/pollOptions';
import env from '../../env';
import type { PaymentsRepository } from './payments.repository';
import type { PlanRepository } from './plans.repository';
import { exportToSheet } from './sheets.service';
import type { UsersContext } from './users.handler';
import { UsersRepository, type VPNUser } from './users.repository';

export class UsersService {
	constructor(
		private repository: UsersRepository,
		private paymentsRepository: PaymentsRepository,
		private plansRepository: PlanRepository,
	) {}

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
		paymentSteps: {
			amount: false,
			months: false,
			expires: false,
		},
	};

	async create(
		message: Message,
		context: UsersContext,
		start = false,
		selectedOptions: (Device | VPNProtocol)[] = [],
	) {
		logger.log(
			`[${basename(__filename)}]: create. Active step ${this.getActiveStep(this.state.createSteps) ?? 'first'}`,
		);
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
		logger.log(`[${basename(__filename)}]: list`);
		const users = await this.repository.list();
		const chunkSize = 50;
		const buttons = users.map(({ id, username, firstName, lastName }) => [
			{
				text: `${username} (${firstName ?? ''} ${lastName ?? ''})`,
				callback_data: JSON.stringify({
					s: CommandScope.Users,
					c: {
						cmd: VPNUserCommand.GetUser,
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

	async getById(message: Message, context: UsersContext) {
		logger.log(`[${basename(__filename)}]: getById`);
		const user = await this.repository.getById(Number(context.id));
		await bot.sendMessage(message.chat.id, this.formatUserInfo(user));
		await bot.sendMessage(message.chat.id, 'Select field to update', createUserOperationsKeyboard(user.id));
		globalHandler.finishCommand();
	}

	async update(
		message: Message,
		context: UsersContext,
		state: { init: boolean },
		selectedOptions: (Device | VPNProtocol)[] = [],
	) {
		logger.log(`[${basename(__filename)}]: update`);
		const textProps = ['telegramLink', 'firstName', 'lastName', 'username'];
		const textProp = textProps.includes(context.prop);
		if (state.init) {
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
			state.init = false;
			return;
		}
		if (selectedOptions.length) {
			const updated = await this.repository.update(context.id, {
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
		const updated = await this.repository.update(context.id, {
			[context.prop]: textProp ? message.text : message.user_shared.user_id.toString(),
		});
		logger.success(`User info has been successfully updated for user ${context.id}`);
		await bot.sendMessage(message.chat.id, this.formatUserInfo(updated));
		globalHandler.finishCommand();
	}

	async delete(msg: Message, context: UsersContext, start: boolean) {
		logger.log(`[${basename(__filename)}]: delete`);
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

	async pay(message: Message, context: UsersContext) {
		logger.log(
			`[${basename(__filename)}]: pay. Active step "${this.getActiveStep(this.state.paymentSteps) ?? 'first'}"`,
		);
		if (message.user_shared?.user_id) {
			const user = await this.repository.getByTelegramId(message.user_shared.user_id.toString());
			this.state.params.set('user', user);
			await bot.sendMessage(message.chat.id, `Pay operation for user ${user.username}. Enter amount`);
			this.setActiveStep('amount', this.state.paymentSteps);
			return;
		}
		const user: VPNUser = this.state.params.get('user');
		if (!user) {
			const errorMessage = `Unexpected error while pay processing. User did not found`;
			logger.error(`[${basename(__filename)}]: ${errorMessage}`);
			await bot.sendMessage(message.chat.id, errorMessage);
			this.state.params.clear();
			globalHandler.finishCommand();
			return;
		}
		if (this.state.paymentSteps.amount) {
			const amount = Number(message.text);
			this.state.params.set('amount', amount);
			const plan = await this.plansRepository.findPlan(amount, user.price);
			const monthsCount = plan ? plan.months : Math.floor(amount / user.price);
			if (plan) {
				await bot.sendMessage(
					message.chat.id,
					`Найден план ${plan.name} для ${plan.amount} рублей. 
Цена: ${plan.price} 
Количество человек: ${plan.peopleCount}
Количество месяцев: ${plan.months}
					`,
				);
			}
			await bot.sendMessage(
				message.chat.id,
				`Calculated months count: ${monthsCount}. If you want to provide custom just enter in new message`,
				acceptKeyboard,
			);
			this.state.params.set('months', monthsCount);
			this.setActiveStep('months', this.state.paymentSteps);
			return;
		}
		if (this.state.paymentSteps.months) {
			if (!context.accept) {
				this.state.params.set('months', Number(message.text));
			}
			let months = this.state.params.get('months');
			const calculated = addMonths(new Date(), months);
			await bot.sendMessage(
				message.chat.id,
				`Calculated expires on date: ${calculated.toISOString()}. If you want to provide custom just enter new date in ISO format like 2025-01-01 or 2025-02-02T22:59:24Z`,
				acceptKeyboard,
			);
			this.state.params.set('expires', calculated);
			this.setActiveStep('expires', this.state.paymentSteps);
			return;
		}
		if (this.state.paymentSteps.expires && !context.accept) {
			this.state.params.set('expires', new Date(message.text));
		}
		try {
			const amount = this.state.params.get('amount');
			const monthsCount = this.state.params.get('months');
			const expiresOn = this.state.params.get('expires');
			await this.paymentsRepository.create(user.id, Number(amount), Number(monthsCount), expiresOn);
			const successMessage = `Payment ${message.text} has been successfully processed for user ${user.username}`;
			await logger.success(`${basename(__filename)}: ${successMessage}`);
			await bot.sendMessage(message.chat.id, successMessage);
		} catch (err) {
			const errMessage = `Unexpected error while pay processing for user ${user.username}: ${err}`;
			await bot.sendMessage(message.chat.id, errMessage);
			await logger.error(`[${basename(__filename)}]: ${errMessage}`);
		} finally {
			this.state.params.clear();
			globalHandler.finishCommand();
		}
	}

	async sync(message: Message) {
		logger.log(`[${basename(__filename)}]: sync`);
		const data = await this.repository.list();
		const header = [
			'id',
			'username',
			'telegram ID',
			'telegram link',
			'first name',
			'last name',
			'price',
			'is free',
			'devices',
			'protocols',
			'created at',
		];
		const preparedData = data.map(row => {
			return [
				row.id ? row.id.toString() : '',
				row.username ?? '',
				row.telegramId ?? '',
				row.telegramLink ?? '',
				row.firstName ?? '',
				row.lastName ?? '',
				row.price ? row.price.toString() : '',
				row.free ? 'TRUE' : 'FALSE',
				row.devices?.length ? row.devices.join(', ') : '',
				row.protocols?.length ? row.protocols.join(', ') : '',
				row.createdAt ? row.createdAt.toISOString() : '',
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

	private setCreateStep(current: string) {
		this.setActiveStep(current, this.state.createSteps);
	}

	private setPaymentStep(current: string) {
		this.setActiveStep(current, this.state.paymentSteps);
	}

	private setActiveStep(current: string, steps) {
		Object.keys(steps).forEach(k => {
			steps[k] = false;
			steps[current] = true;
		});
	}

	private async getPossiblePayers(message: Message) {
		const users = await this.repository.payersList();
		const chunkSize = 50;
		const buttons = users.map(({ id, username, firstName, lastName }) => [
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
${user.payer?.username ? 'Payer: ' + user.payer?.username : ''}
${user.dependants?.length ? 'Dependants: ' + user.dependants?.map(u => u.username).join(', ') : ''}
Created At: ${format(user.createdAt, 'dd.MM.yyyy')}
		`;
	}
}
