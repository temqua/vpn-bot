import type { Payment, Plan } from '@prisma/client';
import { addMonths } from 'date-fns';
import type { Message } from 'node-telegram-bot-api';
import { basename } from 'path';
import { formatDate, setActiveStep } from '../../core';
import bot from '../../core/bot';
import { acceptKeyboard, yesNoKeyboard } from '../../core/buttons';
import { UserRequest } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import logger from '../../core/logger';
import { NalogService } from './nalog.service';
import { PaymentsRepository } from './payments.repository';
import { PlanRepository } from './plans.repository';
import type { UsersContext } from './users.handler';
import { UsersRepository, type VPNUser } from './users.repository';

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
			dependants: false,
		},
	};

	async showPayments(message: Message, context: UsersContext) {
		const payments = await this.repository.getAllByUserId(Number(context.id));
		if (!payments.length) {
			await bot.sendMessage(message.chat.id, 'Не найдено платежей для данного пользователя');
		}
		for (const p of payments) {
			await this.showPaymentInfo(message, p);
		}
		globalHandler.finishCommand();
	}

	async pay(message: Message, context: UsersContext, start: boolean) {
		this.log(`pay. Active step "${this.getActiveStep(this.state.paymentSteps) ?? 'start'}"`);
		if (start) {
			setActiveStep('user', this.state.paymentSteps);
			if (!context.id) {
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
			setActiveStep('amount', this.state.paymentSteps);
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
			await this.calculateMonthsCount(message.chat.id, user);
			return;
		}
		if (this.state.paymentSteps.months) {
			if (!context.accept) {
				this.state.params.set('months', Number(message.text));
			}
			delete context.accept;
			await this.calculateExpirationDate(message.chat.id, user);
			return;
		}
		if (this.state.paymentSteps.expires) {
			if (!context.accept) {
				this.state.params.set('expires', new Date(message.text));
			}
			delete context.accept;
			await bot.sendMessage(message.chat.id, `Добавить налог?`, yesNoKeyboard);
			this.state.params.set('nalog', false);
			this.setPaymentStep('nalog');
			return;
		}
		if (this.state.paymentSteps.nalog) {
			this.state.params.set('nalog', Boolean(context?.accept));
			if (user.dependants.length) {
				await bot.sendMessage(message.chat.id, `Добавить платежи для дочерних юзеров?`, yesNoKeyboard);
				this.state.params.set('dependants', false);
				this.setPaymentStep('dependants');
				return;
			}
		}
		if (this.state.paymentSteps.dependants) {
			this.state.params.set('dependants', Boolean(context?.accept));
		}
		await this.executePayment(message.chat.id, user);
	}

	async showAll(msg: Message) {
		const payments = await this.repository.getAll();
		for (const p of payments) {
			await this.showPaymentInfo(msg, p);
		}
	}

	private async addPaymentNalog(chatId: number, username: string, amount: number) {
		this.log('add nalog');
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

	private formatPayment(p: Payment) {
		return `UUID: ${p.id}				
Payment Date: ${formatDate(p.paymentDate)}
Months Count: ${p.monthsCount}
Expires On: ${formatDate(p.expiresOn)}
Amount: ${p.amount} ${p.currency}
${p.parentPaymentId ? 'Parent payment ID: ' + p.parentPaymentId : ''}`;
	}

	private async calculateMonthsCount(chatId: number, user: VPNUser) {
		const amount = this.state.params.get('amount');
		const dependants = user.dependants?.length ?? 0;
		const plan = await this.plansRepository.findPlan(amount, user.price, 1 + dependants);
		if (user.dependants?.length) {
			await bot.sendMessage(
				chatId,
				`Обнаружено ${user.dependants.length} зависимых клиентов: ${user.dependants.map(u => u.username).join(', ')}`,
			);
		}
		if (plan) {
			await bot.sendMessage(
				chatId,
				`Найден план ${plan.name} для ${plan.amount} ${plan.currency}. 
Цена: ${plan.price} 
Количество человек: ${plan.peopleCount}
Количество месяцев: ${plan.months}
				`,
			);
			this.state.params.set('plan', plan);
		}
		const monthsCount = plan
			? plan.months
			: dependants > 0
				? Math.floor(amount / (user.price * (dependants + 1)))
				: Math.floor(amount / user.price);
		await bot.sendMessage(
			chatId,
			`Вычисленное количество месяцев на основании найденного плана, либо по существующей цене ${user.price} для пользователя: ${monthsCount}. Можно ввести своё количество ответным сообщением`,
			acceptKeyboard,
		);
		this.state.params.set('months', monthsCount);
		this.setPaymentStep('months');
	}

	private async calculateExpirationDate(chatId: number, user: VPNUser) {
		const months = this.state.params.get('months');
		const lastPayment = await this.repository.getLastPayment(user.id);
		if (lastPayment) {
			await bot.sendMessage(
				chatId,
				`Последний платёж этого пользователя количеством ${lastPayment.amount} ${lastPayment.currency} создан ${formatDate(lastPayment.paymentDate)} на ${lastPayment.monthsCount} месяцев и истекает ${formatDate(lastPayment.expiresOn)}`,
			);
		}
		const calculated = addMonths(lastPayment?.expiresOn ?? new Date(), months);
		await bot.sendMessage(
			chatId,
			`Вычисленная дата окончания работы: ${calculated.toISOString()}. 
Можно отправить свою дату в ISO формате 2025-01-01 или 2025-02-02T22:59:24Z`,
			acceptKeyboard,
		);
		this.state.params.set('expires', calculated);
		this.setPaymentStep('expires');
	}

	private async executePayment(chatId: number, user: VPNUser) {
		try {
			const amount = this.state.params.get('amount');
			const monthsCount = this.state.params.get('months');
			const expiresOn = this.state.params.get('expires');
			const nalog = this.state.params.get('nalog');
			const plan: Plan = this.state.params.get('plan') ?? null;
			const dependants = this.state.params.get('dependants');
			const result = await this.repository.create(user.id, {
				amount: Number(amount),
				monthsCount: Number(monthsCount),
				expiresOn,
				plan,
			});
			if (result) {
				const successMessage = `Платёж количеством ${amount} рублей на ${monthsCount} месяцев был успешно обработан для пользователя ${user.username}. 
Новая дата истечения срока ${formatDate(expiresOn)}. 
ID платежа ${result.id}`;
				logger.success(`${basename(__filename)}: ${successMessage}`);
				await bot.sendMessage(chatId, successMessage);
				if (nalog) {
					await this.addPaymentNalog(chatId, user.username, amount);
				}
				if (dependants) {
					for (const dep of user.dependants) {
						const childResult = await this.repository.create(dep.id, {
							amount: 0,
							monthsCount: Number(monthsCount),
							expiresOn,
							plan,
							parentPaymentId: result.id,
						});
						if (childResult) {
							const successMessage = `Платёж для дочернего юзера на ${monthsCount} месяцев был успешно обработан для пользователя ${dep.username}. 
Новая дата истечения срока ${formatDate(expiresOn)}. 
ID платежа ${result.id}`;
							logger.success(`${basename(__filename)}: ${successMessage}`);
							await bot.sendMessage(chatId, successMessage);
						} else {
							const errMessage = `По непредвиденным обстоятельствам платеж для дочернего пользователя ${dep.username} не был создан`;
							logger.error(`[${basename(__filename)}]: ${errMessage}`);
							await bot.sendMessage(chatId, errMessage);
						}
					}
				}
			} else {
				const errMessage = `По непредвиденным обстоятельствам платеж для пользователя ${user.username} не был создан`;
				logger.error(`[${basename(__filename)}]: ${errMessage}`);
				await bot.sendMessage(chatId, errMessage);
			}
		} catch (err) {
			const errMessage = `Ошибка при обработке платежа для пользователя ${user.username} ${err}`;
			logger.error(`[${basename(__filename)}]: ${errMessage}`);
			await bot.sendMessage(chatId, errMessage);
		} finally {
			this.state.params.clear();
			globalHandler.finishCommand();
		}
	}

	private async showPaymentInfo(message: Message, p: Payment) {
		if (!p.parentPaymentId) {
			await bot.sendMessage(message.chat.id, this.formatPayment(p));
			return;
		}
		await bot.sendMessage(
			message.chat.id,
			`Child payment ${p.id}
Expires On: ${formatDate(p.expiresOn)}`,
		);
		const parentPayment = await this.repository.getById(p.parentPaymentId);
		if (parentPayment) {
			await bot.sendMessage(
				message.chat.id,
				`Parent payment ${parentPayment.id}
Payment Date: ${formatDate(parentPayment.paymentDate)}
Months Count: ${parentPayment.monthsCount}
Expires On: ${formatDate(parentPayment.expiresOn)}
Amount: ${parentPayment.amount} ${parentPayment.currency}`,
			);
		}
	}

	private setPaymentStep(current: string) {
		setActiveStep(current, this.state.paymentSteps);
	}

	private getActiveStep(steps) {
		const result = Object.keys(steps).filter(k => steps[k]);
		if (result.length) {
			return result[0];
		}
		return null;
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
}

export const paymentsService = new PaymentsService(
	new PaymentsRepository(),
	new PlanRepository(),
	new UsersRepository(),
);
