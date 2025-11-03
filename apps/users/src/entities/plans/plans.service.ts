import { Message } from 'node-telegram-bot-api';
import { PlanRepository } from './plans.repository';
import env from '../../env';
import bot from '../../bot';
import { setActiveStep } from '../../utils';
import { basename } from 'path';
import logger from '../../logger';
import { globalHandler } from '../../global.handler';

export class PlansService {
	constructor(private readonly repo: PlanRepository = new PlanRepository()) {}

	createSteps: { [key: string]: boolean } = {
		name: false,
		peopleCount: false,
		monthsCount: false,
		price: false,
		amount: false,
	};
	params = new Map();

	async showAll(chatId: number) {
		const plans = await this.repo.getAll();
		for (const plan of plans) {
			await bot.sendMessage(
				chatId,
				`${plan.name}
		Сумма: ${plan.amount} ${plan.currency} при цене ${plan.price} ${plan.currency}
		Количество человек: ${plan.peopleCount}
		Продолжительность: ${plan.months} месяцев`,
			);
		}
		globalHandler.finishCommand();
	}

	async create(message: Message | null, start = false) {
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
			const created = await this.repo.create(params.get('name'), amount, price, peopleCount, monthsCount);
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

	private setCreateStep(current: string) {
		setActiveStep(current, this.createSteps);
	}
	private resetCreateSteps() {
		Object.keys(this.createSteps).forEach(k => {
			this.createSteps[k] = false;
		});
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
