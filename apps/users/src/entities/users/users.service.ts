import type { Device, User, VPNProtocol } from '@prisma/client';
import { subMonths } from 'date-fns';
import type { InlineKeyboardButton, Message, SendBasicOptions } from 'node-telegram-bot-api';
import { basename } from 'path';
import bot from '../../bot';
import {
	createSubscriptionButton,
	createUserOperationsKeyboard,
	deleteSubscriptionButton,
	getUserContactKeyboard,
	getUserKeyboard,
	getUserMenu,
	getYesNoKeyboard,
	payersKeyboard,
	replySetNullPropKeyboard,
	skipKeyboard,
} from '../../buttons';
import { Bank, BoolFieldState, CmdCode, CommandScope, UserRequest, VPNUserCommand } from '../../enums';
import env from '../../env';
import { globalHandler } from '../../global.handler';
import logger from '../../logger';
import pollOptions from '../../pollOptions';
import { formatDate, setActiveStep } from '../../utils';
import { PaymentsRepository } from '../payments/payments.repository';
import { PasarguardService } from './pasarguard.service';
import { exportToSheet } from './sheets.service';
import { UsersRepository, type VPNUser } from './users.repository';
import { UserCreateCommandContext, UsersContext, UserUpdateCommandContext } from './users.types';
import { ExpensesRepository } from '../expenses/repository';
import { introMessage, userStartMessage } from '../../consts';

export class UsersService {
	constructor(
		private repository: UsersRepository = new UsersRepository(),
		private pasarguardService: PasarguardService = new PasarguardService(),
	) {}

	params = new Map();
	createSteps: { [key: string]: boolean } = {
		telegramId: false,
		username: false,
		firstName: false,
		lastName: false,
		telegramLink: false,
		devices: false,
		protocols: false,
		bank: false,
		pasarguard: false,
	};
	updateSteps = {
		payerSearch: false,
		apply: false,
	};
	private textProps = ['telegramLink', 'firstName', 'lastName', 'username', 'subLink'];
	private boolProps = ['active', 'free'];
	private numberProps = ['price'];

	async create(
		message: Message | null,
		context: UserCreateCommandContext,
		start = false,
		selectedOptions: (Device | VPNProtocol | Bank)[] = [],
	) {
		this.log(`create. Active step ${this.getActiveStep(this.createSteps) ?? 'start'}`);

		const chatId = message ? message.chat.id : context.chatId;
		if (start) {
			await bot.sendMessage(chatId, 'Share user. For skipping just send any text', {
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
			this.params.set('username', message?.text);
			await bot.sendMessage(chatId, 'Enter first name');
			this.setCreateStep('firstName');
			return;
		}
		if (this.createSteps.firstName) {
			this.params.set('first_name', message?.text);
			await bot.sendMessage(chatId, 'Enter last name', skipKeyboard);
			this.setCreateStep('lastName');
			return;
		}
		if (this.createSteps.lastName) {
			if (!context.skip) {
				this.params.set('last_name', message?.text);
			}
			delete context.skip;
			await bot.sendMessage(chatId, 'Enter telegram link', skipKeyboard);
			this.setCreateStep('telegramLink');
			return;
		}
		if (this.createSteps.telegramLink) {
			if (!context.skip) {
				this.params.set('telegram_link', message?.text);
			}
			delete context.skip;
			await bot.sendMessage(chatId, 'Create user in pasarguard?', getYesNoKeyboard(VPNUserCommand.Create));
			this.setCreateStep('subLink');
			return;
		}
		if (this.createSteps.subLink) {
			this.params.set('pasarguard', context.accept);
			delete context.accept;
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
			delete context.skip;
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
			delete context.skip;
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
			delete context.skip;
		}
		const params = this.params;
		const username = params.get('username');

		try {
			const newUser: User = await this.repository.create(
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
			await this.sendNewUserMenu(chatId, newUser);
			if (params.get('pasarguard')) {
				this.createPasarguardUser(chatId, newUser);
				bot.sendMessage(chatId, userStartMessage, getUserKeyboard(chatId));
			}
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
			const users = await this.repository.findByFirstName(message.text ?? '');
			if (users?.length) {
				for (const user of users) {
					await this.sendUserMenu(message.chat.id, user);
				}
			} else {
				await bot.sendMessage(message.chat.id, `No users found in system with first name ${message.text}`);
			}
			globalHandler.finishCommand();
			return;
		}
		await bot.sendMessage(message.chat.id, 'Enter first name');
	}

	async findByUsername(message: Message, start: boolean) {
		this.log('findByUsername');

		if (!start) {
			const users = await this.repository.findByUsername(message.text ?? '');
			if (users?.length) {
				for (const user of users) {
					await this.sendUserMenu(message.chat.id, user);
				}
			} else {
				await bot.sendMessage(message.chat.id, `No users found in system with username ${message.text}`);
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
		if (user) {
			await this.sendUserMenu(message.chat.id, user);
		}
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
		message: Message | null,
		context: UserUpdateCommandContext,
		state: { init: boolean },
		selectedOptions: (Device | VPNProtocol | Bank | BoolFieldState)[] = [],
	) {
		this.log('update');
		const chatId = message?.chat?.id || env.ADMIN_USER_ID;
		const textProp = this.textProps.includes(context.prop);
		const boolProp = this.boolProps.includes(context.prop);
		const numberProp = this.numberProps.includes(context.prop);
		if (state.init) {
			this.initUpdate(message as Message, context);
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
				this.getPossiblePayers(message as Message, context, this.params.get('updateId'));
				this.setUpdateStep('apply');
				return;
			}
			const updateId = this.params.get('updateId');
			try {
				const updated = await this.repository.update(updateId, {
					payerId: context.id,
				});
				logger.success(`Payer has been successfully set to ${context.id} for user ${updateId}`);
				await this.sendUserMenu(chatId, updated);
			} catch (error) {
				const errorMessage = `Error while updating payerId ${error}`;
				logger.error(errorMessage);
				await bot.sendMessage(chatId, errorMessage);
			} finally {
				this.params.clear();
				globalHandler.finishCommand();
			}
			return;
		}
		if (numberProp && ['null', 'undefined'].includes(typeof message?.text)) {
			bot.sendMessage(chatId, `message.text is null/empty ${message?.text}`);
			this.params.clear();
			globalHandler.finishCommand();
			return;
		}
		if (
			!textProp &&
			!numberProp &&
			(typeof message?.user_shared === 'undefined' || typeof message?.user_shared?.user_id === 'undefined')
		) {
			bot.sendMessage(
				chatId,
				`message.user_shared or message.user_shared.user_id is null/empty ${message?.text}`,
			);
			this.params.clear();
			globalHandler.finishCommand();
			return;
		}

		let newValue: string[] | number | string | boolean = '';
		if (context.setNull) {
			newValue = null;
		} else if (textProp) {
			newValue = message?.text as string;
		} else if (numberProp) {
			newValue = Number(message?.text);
		} else {
			newValue = message?.user_shared?.user_id.toString() ?? '';
		}
		this.applyUpdate(chatId, Number(context.id), context.prop, newValue);
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

	async exportExpenses(message: Message) {
		this.log('exportExpenses');

		const expensesData = await new ExpensesRepository().list();
		const preparedExpensesData = expensesData.map(row => {
			return [
				row.id ?? '',
				row.paymentDate ? new Date(row.paymentDate).toLocaleString('ru-RU', { timeZone: 'UTC' }) : '',
				row.amount.toNumber() ?? 0,
				row.category ?? '',
				row.description ?? '',
			];
		});
		try {
			await exportToSheet(env.SHEET_ID, 'Expenses!A2', preparedExpensesData);
			logger.success(`${basename(__filename)}}: Expenses data successfully exported to Google Sheets!`);
			await bot.sendMessage(message.chat.id, '✅ Expenses data successfully exported to Google Sheets!');
		} catch (error) {
			logger.error(`[${basename(__filename)}]: Expenses sync process finished with error: ${error}`);
			await bot.sendMessage(message.chat.id, `❌ Expenses sync process finished with error: ${error}`);
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
		this.log('showUnpaid');
		const users = await this.repository.getUnpaidUsers();
		for (const user of users) {
			if (user.payments.length) {
				const lastPayment = user.payments[0];
				await bot.sendMessage(
					message.chat.id,
					`User ${user.username.replace(/[-.*#_]/g, match => `\\${match}`)} \\(ID ${user.id}\\) last payment UUID \`${lastPayment.id}\`
	Payment Date: ${formatDate(lastPayment.paymentDate).replace(/[-.*#_]/g, match => `\\${match}`)}
	Months count: ${lastPayment.monthsCount}
	Expires on: ${lastPayment.expiresOn ? formatDate(lastPayment.expiresOn).replace(/[-.*#_]/g, match => `\\${match}`) : 'Unset'}
	Amount: ${lastPayment.amount}`,
					{
						parse_mode: 'MarkdownV2',
					},
				);
			} else if (user.createdAt > subMonths(new Date(), 1)) {
				await bot.sendMessage(
					message.chat.id,
					`User ${user.username} ${user.telegramLink ?? ''} created at ${formatDate(user.createdAt)} has to pay soon`,
				);
			}
		}
		if (users.length) {
			await bot.sendMessage(
				message.chat.id,
				`Users 
${users
	.filter(user => user.createdAt < subMonths(new Date(), 1))
	.map(u => `${u.username} ${u.telegramLink ?? ''}`)
	.join('\n')} 
have no payments for next month.`,
			);
			const userButtons: InlineKeyboardButton[][] = users.map(user => {
				return [
					{
						text: user.username,
						callback_data: JSON.stringify({
							[CmdCode.Scope]: CommandScope.Users,
							[CmdCode.Context]: {
								[CmdCode.Command]: VPNUserCommand.GetById,
								id: user.id,
							},
						}),
					},
				];
			});
			await bot.sendMessage(message.chat.id, 'Select user', {
				reply_markup: {
					inline_keyboard: userButtons,
				},
			});
		} else {
			await bot.sendMessage(message.chat.id, 'All users paid the bills 👍');
		}

		globalHandler.finishCommand();
	}

	async showTrial(message: Message) {
		this.log('trial');
		const users = await this.repository.getTrialUsers();
		if (users.length) {
			await bot.sendMessage(
				message.chat.id,
				`Users
${users.map(u => `${u.username} ${u.telegramLink ?? ''} created at: ${formatDate(u.createdAt, 'dd.MM.yyyy')}`).join('\n')} 
currently have a trial period `,
			);
			const userButtons: InlineKeyboardButton[][] = users.map(user => {
				return [
					{
						text: user.username,
						callback_data: JSON.stringify({
							[CmdCode.Scope]: CommandScope.Users,
							[CmdCode.Context]: {
								[CmdCode.Command]: VPNUserCommand.GetById,
								id: user.id,
							},
						}),
					},
				];
			});
			await bot.sendMessage(message.chat.id, 'Select user', {
				reply_markup: {
					inline_keyboard: userButtons,
				},
			});
		} else {
			await bot.sendMessage(message.chat.id, 'No trial users found');
		}
		globalHandler.finishCommand();
	}

	async notifyUnpaid() {
		this.log('notifyUnpaid');
		const users = await this.repository.getUnpaidUsers();
		for (const user of users) {
			if (user.telegramId) {
				const message = user.createdAt < subMonths(new Date(), 1) ? 'пробного периода' : 'подписки';
				bot.sendMessage(
					user.telegramId,
					`Уважаемый пользователь! Время ${message} истекло. Необходимо оплатить впн ему https://t.me/whirliswaiting
150 рублей стоит месяц
800 полгода
1500 год
2200700156700659 т-банк
2202205048878992 сбер
`,
				);
			}
		}
	}

	async showSubscriptionURL(message: Message, context: UsersContext) {
		this.log('showSubscriptionURL');
		const user = await this.repository.getByTelegramId(message.chat.id.toString());
		if (user?.subLink) {
			bot.sendMessage(
				message.chat.id,
				`Ваша ссылка \`https://pg.tesseractnpv.com${user.subLink.replace(/[-.*#_=()]/g, match => `\\${match}`)}\``,
				{
					parse_mode: 'MarkdownV2',
				},
			);

			bot.sendMessage(message.chat.id, 'Управление подпиской', deleteSubscriptionButton);
		} else {
			const isUnpaid = await this.repository.isUserUnpaid(user.id);
			if (isUnpaid) {
				bot.sendMessage(
					message.chat.id,
					`Не обнаружено подписок. Напишите в личные сообщения https://t.me/tesseract_vpn.`,
				);
			} else {
				bot.sendMessage(
					message.chat.id,
					'У вас пока нет подписок. Вы можете создать новую',
					createSubscriptionButton,
				);
			}
		}
	}

	async showSubGuide(chatId: number) {
		bot.sendMessage(chatId, introMessage, {
			parse_mode: 'MarkdownV2',
		});
		bot.sendMessage(chatId, userStartMessage, getUserKeyboard(chatId));
	}

	async createSubscription(message: Message) {
		this.log('createSubscription');
		const user = await this.repository.getByTelegramId(message.chat.id.toString());
		await this.createPasarguardUser(message.chat.id, user);
	}

	async deleteSubscription(message: Message) {
		this.log('deleteSubscription');
		try {
			const user = await this.repository.getByTelegramId(message.chat.id.toString());
			const result = await this.deletePasarguardUser(user);
			if (result) {
				await this.repository.update(user.id, {
					subLink: null,
				});
				bot.sendMessage(message.chat.id, 'Подписка была успешно удалена');
			} else {
				bot.sendMessage(message.chat.id, `Ошибка удаления. Обратитесь к @whirliswaiting`);
			}
		} catch (error) {
			bot.sendMessage(message.chat.id, `Ошибка удаления ${error.message}`);
		}
	}

	private setCreateStep(current: string) {
		setActiveStep(current, this.createSteps);
	}

	private setUpdateStep(current: string) {
		setActiveStep(current, this.updateSteps);
	}

	private async initUpdate(message: Message | null, context: UserUpdateCommandContext) {
		const textProp = this.textProps.includes(context.prop);
		const boolProp = this.boolProps.includes(context.prop);
		const numberProp = this.numberProps.includes(context.prop);
		const chatId = message?.chat?.id ?? env.ADMIN_USER_ID;
		if (textProp || numberProp) {
			await bot.sendMessage(chatId, `Enter ${context.prop}`, replySetNullPropKeyboard(context.prop, context.id));
		} else if (context.prop === 'telegramId') {
			await bot.sendMessage(chatId, 'Share user:', {
				reply_markup: getUserContactKeyboard(UserRequest.Update),
			});
		} else if (boolProp) {
			await bot.sendPoll(chatId, `Choose new state`, pollOptions.boolFieldState, {
				allows_multiple_answers: false,
			});
		} else if (context.prop === 'payerId') {
			this.params.set('updateId', context.id);
			await bot.sendMessage(
				chatId,
				'Send start of username for user searching or click on the button to show all users',
				payersKeyboard,
			);
			this.setUpdateStep('payerSearch');
		} else {
			const foundOptions: string[] = pollOptions[context.prop] ?? [];
			if (foundOptions.length) {
				await bot.sendPoll(chatId, `Select ${context.prop}`, foundOptions, {
					allows_multiple_answers: context.prop !== 'bank',
				});
			}
		}
	}

	private async getPossiblePayers(message: Message, context: UsersContext, userId: string) {
		const possibleUsers = await this.repository.payersList(Number(userId));
		const users = context.accept
			? possibleUsers
			: possibleUsers?.filter(u => u.username.startsWith(message?.text ?? ''));
		if (!users) {
			await bot.sendMessage(message.chat.id, `No payers found in system for user ${userId}`);
			return;
		}
		const buttons = users?.map(({ id, username, firstName, lastName }) => [
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
		const updated: VPNUser = await this.repository.update(id, {
			[prop]: value,
		});
		logger.success(`Field ${prop} has been successfully updated for user ${id}`);
		await bot.sendMessage(chatId, this.formatUserInfo(updated));
		this.params.clear();
		globalHandler.finishCommand();
		return;
	}

	private getActiveStep(steps: { [key: string]: boolean }): string | null {
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

	private async sendNewUserMenu(chatId: number, user: User) {
		await bot.sendMessage(chatId, this.formatBaseUserInfo(user));
		await bot.sendMessage(chatId, 'Select operation', {
			reply_markup: {
				inline_keyboard: getUserMenu(user.id),
			},
		});
	}

	private async sendUserMenu(chatId: number, user: VPNUser) {
		await bot.sendMessage(chatId, this.formatUserInfo(user));
		await bot.sendMessage(chatId, 'Select operation', {
			reply_markup: {
				inline_keyboard: getUserMenu(user.id),
			},
		});
	}

	private formatBaseUserInfo(user: User) {
		let baseInfo = `ID: ${user.id}
Username: ${user.username}
First Name: ${user.firstName}
Last Name: ${user.lastName}
Telegram Link: ${user.telegramLink}
Telegram Id: ${user.telegramId}
Devices: ${user.devices.join(', ')}
Protocols: ${user.protocols.join(', ')}
Price: ${user.price}
Subscription link: ${user.subLink}
Created At: ${formatDate(user.createdAt)}\n`;
		if (user.bank) {
			baseInfo = baseInfo.concat(`Bank: ${user.bank}\n`);
		}
		if (user.free) {
			baseInfo = baseInfo.concat('Is free\n');
		}
		if (!user.active) {
			baseInfo = baseInfo.concat('Inactive\n');
		}
		return baseInfo;
	}

	private formatUserInfo(user: VPNUser) {
		let userInfo = this.formatBaseUserInfo(user);
		if (user.payer?.username) {
			userInfo = userInfo.concat(`Payer: ${user.payer.username}\n`);
		}
		if (user.dependants.length) {
			userInfo = userInfo.concat(
				`Dependants: ${user.dependants?.map(u => `${u.username} ${u.telegramLink ?? ''}\n`).join(', ')}\n`,
			);
		}
		return userInfo;
	}

	private async createPasarguardUser(chatId: number, user: User) {
		let pgUsername = `${user.username}_${user.id}`;
		if (user.telegramId) {
			pgUsername = pgUsername.concat('_', user.telegramId);
		}
		const newPasarguardUser = await this.pasarguardService.createUser(pgUsername);
		if (newPasarguardUser) {
			bot.sendMessage(chatId, `Пользователь ${newPasarguardUser.username} успешно создан в pasarguard.`);
			bot.sendMessage(
				chatId,
				`Ваша ссылка \`https://pg.tesseractnpv.com${newPasarguardUser.subscription_url.replace(/[-.*#_=()]/g, match => `\\${match}`)}\``,
				{
					parse_mode: 'MarkdownV2',
				},
			);
			this.showSubGuide(chatId);
			await this.repository.update(user.id, {
				subLink: newPasarguardUser.subscription_url,
			});
			return newPasarguardUser;
		} else {
			await bot.sendMessage(chatId, 'Ошибка во время создания subscription-ссылки');
			return null;
		}
	}

	private async deletePasarguardUser(user: User) {
		let pgUsername = `${user.username}_${user.id}`;
		if (user.telegramId) {
			pgUsername = pgUsername.concat('_', user.telegramId);
		}
		return await this.pasarguardService.deleteUser(pgUsername);
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
}

export const usersService = new UsersService();
