import type { Payment, Plan } from '@prisma/client';
import { addMonths, parse } from 'date-fns';
import type { Message } from 'node-telegram-bot-api';
import { basename } from 'path';
import { formatDate, setActiveStep } from '../../core';
import bot from '../../core/bot';
import { acceptKeyboard, getFrequestPaymentAmountsKeyboard, yesNoKeyboard } from '../../core/buttons';
import { UserRequest } from '../../core/enums';
import { globalHandler } from '../../core/global.handler';
import logger from '../../core/logger';
import { NalogService } from '../users/nalog.service';
import { PaymentsRepository } from './payments.repository';
import { PlanRepository } from '../users/plans.repository';
import type { UsersContext } from '../users/users.handler';
import { UsersRepository, type VPNUser } from '../users/users.repository';

export class PaymentsService {
	constructor(
		private repository: PaymentsRepository = new PaymentsRepository(),
		private plansRepository: PlanRepository = new PlanRepository(),
		private usersRepository: UsersRepository = new UsersRepository(),
	) {}

	private nalogService: NalogService = new NalogService();
	private params = new Map();
	private paymentSteps = {
		user: false,
		amount: false,
		months: false,
		expires: false,
		nalog: false,
		dependants: false,
	};
	private findByDateRangeSteps = {
		from: false,
		to: false,
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

	async sum(chatId: number) {
		const result = await this.repository.sum();
		const amount = result._sum.amount;
		await bot.sendMessage(chatId, `Сумма всех платежей в системе: ${amount}`);
		globalHandler.finishCommand();
	}

	async delete(message: Message, start: boolean) {
		this.log(`delete`);
		if (start) {
			await bot.sendMessage(message.chat.id, 'Enter payment id');
			return;
		}
		try {
			const result = await this.repository.delete(message.text);
			await bot.sendMessage(
				message.chat.id,
				`Платёж с введённым ID \`${result.id.replace(/[-.*#_]/g, match => `\\${match}`)}\` датой ${formatDate(result.paymentDate).replace(/[-.*#_]/g, match => `\\${match}`)} успешно удалён из системы`,
				{
					parse_mode: 'MarkdownV2',
				},
			);
		} catch (err) {
			await bot.sendMessage(message.chat.id, `Ошибка удаления платежа: ${err}`);
			logger.error(err);
		} finally {
			globalHandler.finishCommand();
		}
	}

	async getById(message: Message, start: boolean) {
		this.log('getById');
		if (start) {
			await bot.sendMessage(message.chat.id, 'Enter payment id');
			return;
		}
		const found = await this.repository.getById(message.text);
		if (found) {
			await bot.sendMessage(message.chat.id, 'В системе найден следующий платёж по введённому ID:');
			await this.showPaymentInfo(message, found);
		} else {
			await bot.sendMessage(message.chat.id, 'В системе не найдено платежей с введённым ID');
		}
		globalHandler.finishCommand();
	}

	async findByDate(message: Message, start: boolean) {
		this.log('findByDate');
		if (start) {
			await bot.sendMessage(message.chat.id, 'Enter date in ISO Format (2025-08-03)');
			return;
		}
		try {
			const found = await this.repository.getByDate(parse(message.text, 'yyyy-MM-dd', new Date()));
			if (found.length) {
				await bot.sendMessage(message.chat.id, 'В системе найдены следующие платёжи по указанной дате');
				for (const p of found) {
					await this.showPaymentInfo(message, p);
				}
			} else {
				await bot.sendMessage(message.chat.id, 'В системе не найдено платежей в указанную дату');
			}
		} catch (error) {
			await bot.sendMessage(message.chat.id, `Ошибка поиска платежа по дате: ${error}`);
			logger.error(error);
		} finally {
			globalHandler.finishCommand();
		}
	}

	async findByDateRange(message: Message, start: boolean) {
		this.log('findByDateRange');
		if (start) {
			await bot.sendMessage(message.chat.id, 'Enter date from in ISO Format (2025-08-03)');
			this.findByDateRangeSteps.from = true;
			return;
		}
		if (this.findByDateRangeSteps.from) {
			this.params.set('from', message.text);
			this.findByDateRangeSteps.to = true;
			this.findByDateRangeSteps.from = false;
			await bot.sendMessage(message.chat.id, 'Enter date to in ISO Format (2025-08-03)');
			return;
		}
		try {
			const fromStr = this.params.get('from');
			let from = parse(fromStr, 'yyyy-MM-dd', new Date());
			let to = parse(message.text, 'yyyy-MM-dd', new Date());
			if (from > to) {
				const temp = from;
				from = to;
				to = temp;
			}
			const found = await this.repository.getByDateRange(from, to);
			if (found.length) {
				await bot.sendMessage(message.chat.id, 'В системе найдены следующие платёжи в указанные даты');
				for (const p of found) {
					await this.showPaymentInfo(message, p);
				}
			} else {
				await bot.sendMessage(message.chat.id, 'В системе не найдено платежей в указанные даты');
			}
		} catch (error) {
			await bot.sendMessage(message.chat.id, `Ошибка поиска платежей по датам: ${error}`);
			logger.error(error);
		} finally {
			globalHandler.finishCommand();
		}
	}

	async pay(message: Message, context: UsersContext, start: boolean) {
		this.log(`pay. Active step "${this.getActiveStep(this.paymentSteps) ?? 'start'}"`);
		if (start) {
			setActiveStep('user', this.paymentSteps);
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
		if (this.paymentSteps.user) {
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
				this.params.clear();
				globalHandler.finishCommand();
				return;
			}
			this.params.set('user', user);
			const prices = [user.price];
			if (user.payments.length) {
				const lastPayment = user.payments[user.payments.length - 1];
				if (lastPayment.amount !== user.price) {
					prices.push(lastPayment.amount);
				}
			}
			await bot.sendMessage(
				message.chat.id,
				`Платёжная операция для пользователя ${user.username}. Введите количество денег в рублях, либо выберите из списка`,
				getFrequestPaymentAmountsKeyboard(prices),
			);
			setActiveStep('amount', this.paymentSteps);
			return;
		}

		const user: VPNUser = this.params.get('user');
		if (!user) {
			const errorMessage = `Ошибка при обработке платежа. Пользователь не найден в системе`;
			logger.error(`[${basename(__filename)}]: ${errorMessage}`);
			await bot.sendMessage(message.chat.id, errorMessage);
			this.params.clear();
			globalHandler.finishCommand();
			return;
		}
		if (this.paymentSteps.amount) {
			const amount = context.a ? Number(context.a) : Number(message.text);
			this.params.set('amount', amount);
			await this.calculateMonthsCount(message.chat.id, user);
			return;
		}
		if (this.paymentSteps.months) {
			if (!context.accept) {
				this.params.set('months', Number(message.text));
			}
			delete context.accept;
			await this.calculateExpirationDate(message.chat.id, user);
			return;
		}
		if (this.paymentSteps.expires) {
			if (!context.accept) {
				this.params.set('expires', new Date(message.text));
			}
			delete context.accept;
			await bot.sendMessage(message.chat.id, `Добавить налог?`, yesNoKeyboard);
			this.params.set('nalog', false);
			this.setPaymentStep('nalog');
			return;
		}
		if (this.paymentSteps.nalog) {
			this.params.set('nalog', Boolean(context?.accept));
			if (user.dependants.length) {
				await bot.sendMessage(message.chat.id, `Добавить платежи для дочерних юзеров?`, yesNoKeyboard);
				this.params.set('dependants', false);
				this.setPaymentStep('dependants');
				return;
			}
		}
		if (this.paymentSteps.dependants) {
			this.params.set('dependants', Boolean(context?.accept));
		}
		await this.executePayment(message.chat.id, user);
	}

	async showAll(msg: Message) {
		const payments = await this.repository.getAll();
		for (const p of payments) {
			await this.showPaymentInfo(msg, p);
		}
		globalHandler.finishCommand();
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
		return `UUID: \`${p.id}\`				
Payment Date: ${formatDate(p.paymentDate).replace(/[-.*#_]/g, match => `\\${match}`)}
Months Count: ${p.monthsCount}
Expires On: ${formatDate(p.expiresOn).replace(/[-.*#_]/g, match => `\\${match}`)}
Amount: ${p.amount} ${p.currency}
${p.parentPaymentId ? 'Parent payment ID: ' + p.parentPaymentId : ''}`;
	}

	private async calculateMonthsCount(chatId: number, user: VPNUser) {
		const amount = this.params.get('amount');
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
			this.params.set('plan', plan);
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
		this.params.set('months', monthsCount);
		this.setPaymentStep('months');
	}

	private async calculateExpirationDate(chatId: number, user: VPNUser) {
		const months = this.params.get('months');
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
			`Вычисленная дата окончания работы: ${formatDate(calculated)}. 
Можно отправить свою дату в ISO формате без времени: 2025-01-01 
Или с временем 2025-02-02T22:59:24Z`,
			acceptKeyboard,
		);
		this.params.set('expires', calculated);
		this.setPaymentStep('expires');
	}

	private async executePayment(chatId: number, user: VPNUser) {
		try {
			const amount = this.params.get('amount');
			const monthsCount = this.params.get('months');
			const expiresOn = this.params.get('expires');
			const nalog = this.params.get('nalog');
			const plan: Plan = this.params.get('plan') ?? null;
			const dependants = this.params.get('dependants');
			const result = await this.repository.create(user.id, {
				amount: Number(amount),
				monthsCount: Number(monthsCount),
				expiresOn,
				plan,
			});
			if (result) {
				const successMessage = `Платёж количеством ${amount} рублей на ${monthsCount} месяцев был успешно обработан для пользователя ${user.username}. 
Новая дата истечения срока ${formatDate(expiresOn)}.`;
				logger.success(`${basename(__filename)}: ${successMessage}`);
				await bot.sendMessage(chatId, successMessage);
				await bot.sendMessage(
					chatId,
					`ID платежа: \`${result.id.replace(/[-.*#_]/g, match => `\\${match}`)}\``,
					{
						parse_mode: 'MarkdownV2',
					},
				);
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
Новая дата истечения срока ${formatDate(expiresOn)}`;
							logger.success(`${basename(__filename)}: ${successMessage}`);
							await bot.sendMessage(chatId, successMessage);
							await bot.sendMessage(
								chatId,
								`ID платежа: \`${result.id.replace(/[-.*#_]/g, match => `\\${match}`)}\``,
								{
									parse_mode: 'MarkdownV2',
								},
							);
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
			this.params.clear();
			globalHandler.finishCommand();
		}
	}

	private async showPaymentInfo(message: Message, p: Payment) {
		if (!p.parentPaymentId) {
			await bot.sendMessage(message.chat.id, this.formatPayment(p), {
				parse_mode: 'MarkdownV2',
			});
			return;
		}
		await bot.sendMessage(
			message.chat.id,
			`Child payment \`${p.id.replace(/[-.*#_]/g, match => `\\${match}`)}\`
Expires On: ${formatDate(p.expiresOn).replace(/[-.*#_]/g, match => `\\${match}`)}`,
			{
				parse_mode: 'MarkdownV2',
			},
		);
		const parentPayment = await this.repository.getById(p.parentPaymentId);
		if (parentPayment) {
			await bot.sendMessage(
				message.chat.id,
				`Parent payment \`${parentPayment.id.replace(/[-.*#_]/g, match => `\\${match}`)}\`
Payment Date: ${formatDate(parentPayment.paymentDate).replace(/[-.*#_]/g, match => `\\${match}`)}
Months Count: ${parentPayment.monthsCount}
Expires On: ${formatDate(parentPayment.expiresOn).replace(/[-.*#_]/g, match => `\\${match}`)}
Amount: ${parentPayment.amount} ${parentPayment.currency}`,
				{
					parse_mode: 'MarkdownV2',
				},
			);
		}
	}

	private setPaymentStep(current: string) {
		setActiveStep(current, this.paymentSteps);
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

export const paymentsService = new PaymentsService();
