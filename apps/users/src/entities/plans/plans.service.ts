import { Message, User as TGUser } from 'node-telegram-bot-api';
import { basename } from 'path';
import bot from '../../bot';
import { getMonthsCountMessage, getPeopleCountMessage } from '../../dict';
import { CmdCode, CommandScope, PlanCommand } from '../../enums';
import env from '../../env';
import { globalHandler } from '../../global.handler';
import logger from '../../logger';
import { setActiveStep } from '../../utils';
import { getUserKeyboard } from '../users/users.buttons';
import { UsersRepository } from '../users/users.repository';
import { PlanRepository } from './plans.repository';
import { PlansContext } from './plans.types';
export class PlansService {
	constructor(
		private readonly repository: PlanRepository = new PlanRepository(),
		private readonly usersRepo: UsersRepository = new UsersRepository(),
	) {}

	createSteps: { [key: string]: boolean } = {
		name: false,
		minCount: false,
		maxCount: false,
		monthsCount: false,
		price: false,
		amount: false,
	};
	params = new Map();

	async showAll(chatId: number) {
		this.log('showAll');
		const plans = await this.repository.getAll();
		for (const plan of plans) {
			await bot.sendMessage(
				chatId,
				`${plan.name}
За ${plan.minCount} ­— ${plan.maxCount} человек
Сумма: ${plan.amount} ${plan.currency} при цене ${plan.price} ${plan.currency}
Продолжительность: ${plan.months} месяцев`,
				{
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: 'Delete',
									callback_data: JSON.stringify({
										[CmdCode.Scope]: CommandScope.Plans,
										[CmdCode.Context]: {
											[CmdCode.Command]: PlanCommand.Delete,
											id: plan.id,
										},
										[CmdCode.Processing]: 1,
									}),
								},
							],
						],
					},
				},
			);
		}
		globalHandler.finishCommand();
	}

	async showForUser(message: Message, from: TGUser) {
		const chatId: number = message.chat.id;
		const lang = from.is_bot ? 'ru' : from.language_code;
		this.log('showForUser');
		const user = await this.usersRepo.getByTelegramId(chatId.toString());
		const plans = await this.repository.getByPrice(user.price);
		const plansGroupped = Object.groupBy(plans, p => p.minCount);

		const prepared = Object.keys(plansGroupped)
			.map(k => {
				const count = Number(k);
				const plans = plansGroupped[k];

				const header = `${getPeopleCountMessage(count, lang)}:\n`;
				const together = plans
					.map(p => {
						return `⚫️ ${getMonthsCountMessage(p.months, lang)} — ${p.amount} RUB`;
					})
					.join('\n');
				return count === 1 ? together : header.concat(together);
			})
			.join('\n');
		const finalMessage = `${getPeopleCountMessage(1, lang)}:
⚫️${getMonthsCountMessage(1, lang)} — ${user.price} RUB`.concat(`\n${prepared}`);
		bot.editMessageText(finalMessage, {
			message_id: message.message_id,
			chat_id: message.chat.id,
			reply_markup: getUserKeyboard(lang),
		});
		globalHandler.finishCommand();
	}

	async create(message: Message | null, start = false) {
		this.log('create');
		const chatId = message ? message.chat.id : env.ADMIN_USER_ID;
		if (start) {
			await bot.sendMessage(chatId, 'Enter new plan name');
			this.setCreateStep('name');
			return;
		}
		if (this.createSteps.name) {
			this.params.set('name', message?.text);
			await bot.sendMessage(chatId, 'Enter amount');
			this.setCreateStep('amount');
			return;
		}
		if (this.createSteps.amount) {
			this.params.set('amount', message?.text);
			await bot.sendMessage(chatId, 'Enter price');
			this.setCreateStep('price');
			return;
		}
		if (this.createSteps.price) {
			this.params.set('price', message?.text);
			await bot.sendMessage(chatId, 'Enter min people count');
			this.setCreateStep('minCount');
			return;
		}
		if (this.createSteps.minCount) {
			this.params.set('minCount', message?.text);
			await bot.sendMessage(chatId, 'Enter max people count');
			this.setCreateStep('maxCount');
			return;
		}
		if (this.createSteps.maxCount) {
			this.params.set('maxCount', message?.text);
			await bot.sendMessage(chatId, 'Enter months count');
			this.setCreateStep('monthsCount');
			return;
		}
		this.params.set('monthsCount', message?.text);

		const params = this.params;
		try {
			const price = Number(params.get('price'));
			const maxCount = Number(params.get('maxCount'));
			const minCount = Number(params.get('minCount'));
			const amount = Number(params.get('amount'));
			const monthsCount = Number(params.get('monthsCount'));
			this.validate();
			const created = await this.repository.create(
				params.get('name'),
				amount,
				price,
				minCount,
				maxCount,
				monthsCount,
			);
			if (created) {
				await bot.sendMessage(
					chatId,
					`Plan ${created.name} with amount ${created.amount} for price ${created.price} with min ${created.minCount} and max ${created.maxCount} people and ${created.months} months has been successfully created`,
				);
			} else {
				logger.error(`[${basename(__filename)}]: Plan was not created for unknown reason`);
				await bot.sendMessage(chatId, 'Plan was not created for unknown reason');
			}
		} catch (error) {
			const errorMessage = `Unexpected error occurred while creating plan. ${error}`;
			logger.error(`[${basename(__filename)}]: ${errorMessage}`);
			await bot.sendMessage(chatId, errorMessage);
		} finally {
			this.params.clear();
			this.resetCreateSteps();
			globalHandler.finishCommand();
		}
	}

	async delete(msg: Message, context: PlansContext, start = false) {
		this.log('delete');
		if (!start) {
			await this.repository.delete(Number(context.id));
			const message = `Plan with id ${context.id} has been successfully removed`;
			logger.success(`[${basename(__filename)}]: ${message}`);
			await bot.sendMessage(msg.chat.id, message);
			globalHandler.finishCommand();
			return;
		}
		const plans = await this.repository.getAll();
		const buttons = plans.map(({ name, id }) => [
			{
				text: name,
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Plans,
					[CmdCode.Context]: {
						[CmdCode.Command]: PlanCommand.Delete,
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
		await bot.sendMessage(msg.chat.id, 'Select plan to delete:', inlineKeyboard);
	}

	private setCreateStep(current: string) {
		setActiveStep(current, this.createSteps);
	}
	private resetCreateSteps() {
		Object.keys(this.createSteps).forEach(k => {
			this.createSteps[k] = false;
		});
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}

	private validate() {
		const price = Number(this.params.get('price'));
		const minCount = Number(this.params.get('minCount'));
		const maxCount = Number(this.params.get('maxCount'));
		const amount = Number(this.params.get('amount'));
		const monthsCount = Number(this.params.get('monthsCount'));
		if (isNaN(price)) {
			throw new Error('Enter valid price number');
		}
		if (isNaN(amount)) {
			throw new Error('Enter valid amount number');
		}
		if (isNaN(minCount)) {
			throw new Error('Enter valid min people count — must be a number in range between 1 and 6');
		}
		if (isNaN(maxCount)) {
			throw new Error('Enter valid max people count — must be a number in range between 1 and 6');
		}
		if (isNaN(monthsCount)) {
			throw new Error('Enter valid months count number');
		}
		if (price < 50 || price > 150) {
			throw new Error('Price must be between 50 and 150');
		}
		if (minCount > 6 || minCount < 1) {
			throw new Error('People count must be in range between 1 and 6');
		}
		if (minCount > 6 || minCount < 1) {
			throw new Error('People count must be in range between 1 and 6');
		}
		if (maxCount < minCount) {
			throw new Error('Max people count must be greater than min people count');
		}
		if (amount < 0) {
			throw new Error('Amount must be positive value');
		}
	}
}
