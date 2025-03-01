import type { Message } from 'node-telegram-bot-api';
import type { PaymentsRepository } from './payments.repository';
import type { PlanRepository } from './plans.repository';
import type { UsersContext } from './users.handler';
import bot from '../../core/bot';
import { formatDate } from '../../core';
import { globalHandler, type CommandDetailCompressed } from '../../core/globalHandler';
import logger from '../../core/logger';
import { NalogService } from './nalog.service';
import type { UsersRepository, VPNUser } from './users.repository';
import { basename } from 'path';
import { acceptKeyboard } from '../../core/buttons';
import { addMonths } from 'date-fns';
import { CommandScope, UserRequest, VPNUserCommand } from '../../core/enums';

export class PaymentsService {
	constructor(
		private repository: PaymentsRepository,
		private plansRepository: PlanRepository,
		private usersRepository: UsersRepository,
	) {}

	private nalogService: NalogService = new NalogService();

	private state = {
		params: new Map(),
		paymentSteps: {
			user: false,
			amount: false,
			months: false,
			expires: false,
			nalog: false,
		},
	};

	async showPayments(message: Message, context: UsersContext) {
		const payments = await this.repository.getAllByUserId(Number(context.id));
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

	async pay(message: Message, context: UsersContext, start: boolean) {
		logger.log(
			`[${basename(__filename)}]: pay. Active step "${this.getActiveStep(this.state.paymentSteps) ?? 'start'}"`,
		);
		if (start) {
			if (context.id) {
				this.setActiveStep('user', this.state.paymentSteps);
			} else {
				await bot.sendMessage(message.chat.id, 'Share user or enter username', {
					reply_markup: {
						keyboard: [
							[
								{
									text: 'Share contact',
									request_user: {
										request_id: UserRequest.Pay,
									},
								},
							],
						],
						one_time_keyboard: true, // The keyboard will hide after one use
						resize_keyboard: true, // Fit the keyboard to the screen size
					},
				});
				this.setActiveStep('user', this.state.paymentSteps);
				return;
			}
		}
		if (this.state.paymentSteps.user) {
			let user: VPNUser;
			if (context.id) {
				user = await this.usersRepository.getById(Number(context.id));
			} else if (message.user_shared?.user_id) {
				user = await this.usersRepository.getByTelegramId(message.user_shared.user_id.toString());
			} else {
				user = await this.usersRepository.getByUsername(message.text);
			}

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
			const lastPayment = await this.repository.getLastPayment(user.id);
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
			await bot.sendMessage(message.chat.id, `Добавить налог?`, {
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
			const result = await this.repository.create(user.id, Number(amount), Number(monthsCount), expiresOn);
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

	private setPaymentStep(current: string) {
		this.setActiveStep(current, this.state.paymentSteps);
	}

	private setActiveStep(current: string, steps) {
		Object.keys(steps).forEach(k => {
			steps[k] = false;
			steps[current] = true;
		});
	}

	private getActiveStep(steps) {
		const result = Object.keys(steps).filter(k => steps[k]);
		if (result.length) {
			return result[0];
		}
		return null;
	}
}
