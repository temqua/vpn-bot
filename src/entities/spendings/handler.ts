import type { SpendingCategory } from '@prisma/client';
import type { Message, Poll } from 'node-telegram-bot-api';
import { basename } from 'path';
import { setActiveStep } from '../../core';
import bot from '../../core/bot';
import type { ICommandHandler } from '../../core/contracts';
import { CmdCode, SpendingCommand } from '../../core/enums';
import { globalHandler } from '../../core/global.handler';
import logger from '../../core/logger';
import pollOptions from '../../core/pollOptions';
import { SpendingsRepository } from './repository';

export interface SpendingsContext {
	category?: SpendingCategory;
	amount?: number;
	chatId?: number;
	[CmdCode.Command]: SpendingCommand;
}

class SpendingsHandler implements ICommandHandler {
	constructor(private repository: SpendingsRepository = new SpendingsRepository()) {}
	params = new Map();
	createSteps = {
		category: false,
		amount: false,
		description: false,
	};

	async handle(context: SpendingsContext, message: Message, start = false) {
		if (context.cmd === SpendingCommand.Create) {
			this.create(context, message, start);
		} else {
			this.list(message);
		}
	}

	async create(context: SpendingsContext, message: Message, start = false) {
		context.chatId = message?.chat?.id ?? context.chatId;
		if (start) {
			this.setCreateStep('category');
			if (!context.category) {
				await bot.sendPoll(context.chatId, 'Choose spending category', pollOptions.spendCategories, {
					allows_multiple_answers: false,
				});
				return;
			}
		}
		if (this.createSteps.category) {
			this.params.set('category', context.category);
			this.setCreateStep('amount');
			await bot.sendMessage(context.chatId, 'Enter spending amount');
			return;
		}
		if (this.createSteps.amount) {
			this.params.set('amount', message.text);
			this.setCreateStep('description');
			await bot.sendMessage(context.chatId, 'Enter short description');
			return;
		}
		try {
			const category = this.params.get('category');
			const amount = this.params.get('amount');
			await this.repository.create(category, amount, message.text);
			const msg = `Spending in category ${category} with amount ${amount} has been successfully created`;
			logger.success(msg);
			await bot.sendMessage(context.chatId, `✅ ${msg}`);
		} catch (err) {
			logger.error(`[${basename(__filename)}]: Unexpected error occurred while creating spending: ${err}`);
			await bot.sendMessage(context.chatId, `Unexpected error occurred while creating spending: ${err}`);
		} finally {
			this.params.clear();
			globalHandler.finishCommand();
		}
	}

	async list(message: Message) {
		const spendings = await this.repository.list();
		for (const spending of spendings) {
			await bot.sendMessage(
				message.chat.id,
				`Found spending ${spending.id} in category ${spending.category} at ${spending.paymentDate}. ${spending.amount} ${spending.currency}. Additional info: ${spending.description}`,
			);
		}
		if (!spendings.length) {
			await bot.sendMessage(message.chat.id, `No spendings found`);
		}
	}

	async handlePoll(context: SpendingsContext, poll: Poll) {
		const selected = poll.options.filter(o => o.voter_count > 0).map(o => o.text);
		context.category = selected[0];
		this.handle(context, null, false);
	}

	private setCreateStep(current: string) {
		setActiveStep(current, this.createSteps);
	}
}

export const spendingsCommandsHandler = new SpendingsHandler();
