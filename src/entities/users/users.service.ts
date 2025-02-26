import type { Device, VPNProtocol } from '@prisma/client';
import { addMonths } from 'date-fns';
import type { InlineKeyboardButton, Message, SendBasicOptions } from 'node-telegram-bot-api';
import { basename } from 'path';
import { formatDate } from '../../core';
import bot from '../../core/bot';
import { acceptKeyboard, createUserOperationsKeyboard, getUserContactKeyboard, skipKeyboard } from '../../core/buttons';
import { CommandScope, UserRequest, VPNUserCommand } from '../../core/enums';
import { globalHandler, type CommandDetailCompressed } from '../../core/globalHandler';
import logger from '../../core/logger';
import pollOptions from '../../core/pollOptions';
import env from '../../env';
import { NalogService } from './nalog.service';
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

	private nalogService = new NalogService();

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
			nalog: false,
		},
	};

	async create(
		message: Message,
		context: UsersContext,
		start = false,
		selectedOptions: (Device | VPNProtocol)[] = [],
	) {
		logger.log(
			`[${basename(__filename)}]: create. Active step ${this.getActiveStep(this.state.createSteps) ?? 'start'}`,
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
		await bot.sendMessage(message.chat.id, 'Select operation', {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Update',
							callback_data: JSON.stringify({
								s: CommandScope.Users,
								c: {
									cmd: VPNUserCommand.Expand,
									id: context.id,
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
									id: context.id,
								},
							}),
						},
					],
				],
			},
		});
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

	async showPayments(message: Message, context: UsersContext) {
		const payments = await this.paymentsRepository.getAllByUserId(Number(context.id));
		if (!payments.length) {
			await bot.sendMessage(message.chat.id, 'No payments found for user');
		}
		for (const p of payments) {
			await bot.sendMessage(
				message.chat.id,
				`UUID: ${p.id}				
Payment Date: ${formatDate(p.paymentDate)}
Months Count: ${p.monthsCount}
Expires On: ${formatDate(p.expiresOn)}
Amount: ${p.amount} ${p.currency}`,
			);
		}
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
			`[${basename(__filename)}]: pay. Active step "${this.getActiveStep(this.state.paymentSteps) ?? 'start'}"`,
		);
		if (message.user_shared?.user_id) {
			const user = await this.repository.getByTelegramId(message.user_shared.user_id.toString());
			if (!user) {
				const errorMessage = 'Пользователь не найден в системе';
				logger.error(errorMessage);
				await bot.sendMessage(message.chat.id, errorMessage);
				this.state.params.clear();
				globalHandler.finishCommand();
				return;
			}
			this.state.params.set('user', user);
			await bot.sendMessage(
				message.chat.id,
				`Платёжная операция для пользователя ${user.username}. Введите количество денег в рублях`,
			);
			this.setActiveStep('amount', this.state.paymentSteps);
			return;
		}
		const user: VPNUser = this.state.params.get('user');
		if (!user) {
			const errorMessage = `Ошибка при обработке платежа. Пользователь не найден в системе`;
			logger.error(`[${basename(__filename)}]: ${errorMessage}`);
			await bot.sendMessage(message.chat.id, errorMessage);
			this.state.params.clear();
			globalHandler.finishCommand();
			return;
		}
		if (this.state.paymentSteps.amount) {
			const amount = Number(message.text);
			this.state.params.set('amount', amount);
			const dependants = user.dependants?.length ?? 0;
			const plan = await this.plansRepository.findPlan(amount, user.price, 1 + dependants);
			if (user.dependants?.length) {
				await bot.sendMessage(
					message.chat.id,
					`Обнаружено ${user.dependants.length} зависимых клиентов: ${user.dependants.map(u => u.username).join(', ')}`,
				);
			}
			if (plan) {
				await bot.sendMessage(
					message.chat.id,
					`Найден план ${plan.name} для ${plan.amount} ${plan.currency}. 
Цена: ${plan.price} 
Количество человек: ${plan.peopleCount}
Количество месяцев: ${plan.months}
					`,
				);
			}
			const monthsCount = plan
				? plan.months
				: // : dependants > 0
					// ? Math.floor(amount / (user.price * (dependants + 1)))
					Math.floor(amount / user.price);
			await bot.sendMessage(
				message.chat.id,
				`Вычисленное количество месяцев на основании найденного плана, либо по существующей цене ${user.price} для пользователя: ${monthsCount}. Можно ввести своё количество ответным сообщением`,
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
			const lastPayment = await this.paymentsRepository.getLastPayment(user.id);
			if (lastPayment) {
				await bot.sendMessage(
					message.chat.id,
					`Последний платёж этого пользователя количеством ${lastPayment.amount} ${lastPayment.currency} создан ${formatDate(lastPayment.paymentDate)} на ${lastPayment.monthsCount} месяцев и истекает ${formatDate(lastPayment.expiresOn)}`,
				);
			}
			const calculated = addMonths(lastPayment?.expiresOn ?? new Date(), months);
			await bot.sendMessage(
				message.chat.id,
				`Вычисленная дата окончания работы: ${calculated.toISOString()}. 
Можно отправить свою дату в ISO формате 2025-01-01 или 2025-02-02T22:59:24Z`,
				acceptKeyboard,
			);
			this.state.params.set('expires', calculated);
			this.setActiveStep('expires', this.state.paymentSteps);
			delete context.accept;
			return;
		}
		if (this.state.paymentSteps.expires) {
			if (!context.accept) {
				this.state.params.set('expires', new Date(message.text));
			}
			await bot.sendMessage(message.chat.id, `Добавить налог? Если да, нажмите Accept`, {
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: 'Yes',
								callback_data: JSON.stringify({
									s: CommandScope.Users,
									c: {
										cmd: VPNUserCommand.Pay,
										accept: 1,
									},
									p: 1,
								} as CommandDetailCompressed),
							},
							{
								text: 'No',
								callback_data: JSON.stringify({
									s: CommandScope.Users,
									c: {
										cmd: VPNUserCommand.Pay,
										accept: 0,
									},
									p: 1,
								} as CommandDetailCompressed),
							},
						],
					],
				},
			});
			this.state.params.set('nalog', false);
			this.setActiveStep('nalog', this.state.paymentSteps);
			delete context.accept;
			return;
		}
		if (this.state.paymentSteps.nalog) {
			this.state.params.set('nalog', Boolean(context?.accept));
		}
		try {
			const amount = this.state.params.get('amount');
			const monthsCount = this.state.params.get('months');
			const expiresOn = this.state.params.get('expires');
			const nalog = this.state.params.get('nalog');
			const result = await this.paymentsRepository.create(
				user.id,
				Number(amount),
				Number(monthsCount),
				expiresOn,
			);
			if (result) {
				const successMessage = `Платёж количеством ${amount} рублей на ${monthsCount} месяцев был успешно обработан для пользователя ${user.username}. 
Новая дата истечения срока ${formatDate(expiresOn)}. 
ID платежа ${result.id}`;
				logger.success(`${basename(__filename)}: ${successMessage}`);
				await bot.sendMessage(message.chat.id, successMessage);
				if (nalog) {
					await this.addPaymentNalog(message.chat.id, user.username, amount);
				}
			} else {
				const errMessage = `По непредвиденным обстоятельствам платеж для пользователя ${user.username} не был создан`;
				logger.error(`[${basename(__filename)}]: ${errMessage}`);
				await bot.sendMessage(message.chat.id, errMessage);
			}
		} catch (err) {
			const errMessage = `Ошибка при обработке платежа для пользователя ${user.username} ${err}`;
			logger.error(`[${basename(__filename)}]: ${errMessage}`);
			await bot.sendMessage(message.chat.id, errMessage);
		} finally {
			this.state.params.clear();
			globalHandler.finishCommand();
		}
	}

	async addPaymentNalog(chatId: number, username: string, amount: number) {
		logger.log(`[${basename(__filename)}]: add nalog`);
		try {
			const token = await this.nalogService.auth();
			const paymentId = await this.nalogService.addNalog(token, amount);
			if (!paymentId) {
				const errMessage = `Ошибка! При добавлении налога за пользователя ${username} не получен ID операции`;
				logger.error(`[${basename(__filename)}]: ${errMessage}`);
				await bot.sendMessage(chatId, errMessage);
			} else {
				const successMessage = `Налог успешно добавлен за пользователя ${username}`;
				logger.success(`[${basename(__filename)}]: ${successMessage} `);
				await bot.sendMessage(chatId, successMessage);
			}
		} catch (err) {
			const errMessage = `Ошибка при добавлении налога для пользователя ${username}: ${err}`;
			logger.error(`[${basename(__filename)}]: ${errMessage}`);
			await bot.sendMessage(chatId, errMessage);
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
Created At: ${formatDate(user.createdAt)}
${user.payer?.username ? 'Payer: ' + user.payer?.username : ''}${user.dependants?.length ? 'Dependants: ' + user.dependants?.map(u => u.username).join(', ') : ''}
		`;
	}
}
