import { Message } from 'node-telegram-bot-api';
import { basename } from 'path';
import bot from '../../bot';
import env from '../../env';
import { globalHandler } from '../../global.handler';
import logger from '../../logger';
import { setActiveStep } from '../../utils';
import { UsersRepository } from '../users/users.repository';
import { PlanRepository } from './plans.repository';
import { PlansContext } from './plans.types';
import { CmdCode, CommandScope, PlanCommand } from '../../enums';
import { getUserKeyboard } from '../users/users.buttons';
import { dict } from '../../dict';

export class PlansService {
	constructor(
		private readonly repository: PlanRepository = new PlanRepository(),
		private readonly usersRepo: UsersRepository = new UsersRepository(),
	) {}

	createSteps: { [key: string]: boolean } = {
		name: false,
		peopleCount: false,
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
		Количество человек: ${plan.peopleCount}
		Сумма: ${plan.amount} ${plan.currency} при цене ${plan.price} ${plan.currency}
		Продолжительность: ${plan.months} месяцев`,
			);
		}
		globalHandler.finishCommand();
	}

	async showForUser(message: Message) {
		const chatId: number = message.chat.id;
		this.log('showForUser');
		const user = await this.usersRepo.getByTelegramId(chatId.toString());
		const plans = await this.repository.getByPrice(user.price);
		await bot.sendMessage(
			chatId,
			`За 1 человека
Стоимость ${user.price} RUB
На срок 1 месяц`,
		);
		for (const plan of plans) {
			await bot.sendMessage(
				chatId,
				`
За ${plan.peopleCount} человек${plan.peopleCount === 1 ? 'а' : ''}
Стоимость ${plan.amount} ${plan.currency}
На срок ${plan.months} месяц${plan.months > 1 ? 'ев' : ''}`,
			);
		}
		bot.sendMessage(chatId, dict.start[message.from.language_code], getUserKeyboard());
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
			await bot.sendMessage(chatId, 'Enter people count');
			this.setCreateStep('peopleCount');
			return;
		}
		if (this.createSteps.peopleCount) {
			this.params.set('peopleCount', message?.text);
			await bot.sendMessage(chatId, 'Enter months count');
			this.setCreateStep('monthsCount');
			return;
		}
		this.params.set('monthsCount', message?.text);

		const params = this.params;
		try {
			const price = Number(params.get('price'));
			const peopleCount = Number(params.get('peopleCount'));
			const amount = Number(params.get('amount'));
			const monthsCount = Number(params.get('monthsCount'));
			this.validate();
			const created = await this.repository.create(params.get('name'), amount, price, peopleCount, monthsCount);
			if (created) {
				await bot.sendMessage(
					chatId,
					`Plan ${created.name} with amount ${created.amount} for price ${created.price} for ${created.peopleCount} people and ${created.months} months has been successfully created`,
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
						cmd: PlanCommand.Delete,
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
		const peopleCount = Number(this.params.get('peopleCount'));
		const amount = Number(this.params.get('amount'));
		const monthsCount = Number(this.params.get('monthsCount'));
		if (isNaN(price)) {
			throw new Error('Enter valid price number');
		}
		if (isNaN(amount)) {
			throw new Error('Enter valid amount number');
		}
		if (isNaN(peopleCount)) {
			throw new Error('Enter valid people count — must be a number in range between 1 and 6');
		}
		if (isNaN(monthsCount)) {
			throw new Error('Enter valid months count number');
		}
		if (price < 50 || price > 150) {
			throw new Error('Price must be between 50 and 150');
		}
		if (peopleCount > 6 || peopleCount < 1) {
			throw new Error('People count must be in range between 1 and 6');
		}
		if (peopleCount > 6 || peopleCount < 1) {
			throw new Error('People count must be in range between 1 and 6');
		}
		if (amount < 0) {
			throw new Error('Amount must be positive value');
		}
	}
}
