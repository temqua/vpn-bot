import type { SpendingCategory } from '@prisma/client';
import type { Message, Poll } from 'node-telegram-bot-api';
import { setActiveStep } from '../../core';
import bot from '../../core/bot';
import type { ICommandHandler } from '../../core/contracts';
import pollOptions from '../../core/pollOptions';
import { SpendingsRepository } from './repository';
import logger from '../../core/logger';
import { basename } from 'path';
import { globalHandler } from '../../core/globalHandler';

export interface SpendingsContext {
	category?: SpendingCategory;
	amount?: number;
	chatId?: number;
}

class SpendingsHandler implements ICommandHandler {
	private state = {
		params: new Map(),
		createSteps: {
			category: false,
			amount: false,
			description: false,
		},
	};

	async handle(context: SpendingsContext, message: Message, start = false) {
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
		if (this.state.createSteps.category) {
			this.state.params.set('category', context.category);
			this.setCreateStep('amount');
			await bot.sendMessage(context.chatId, 'Enter spending amount');
			return;
		}
		if (this.state.createSteps.amount) {
			this.state.params.set('amount', message.text);
			this.setCreateStep('description');
			await bot.sendMessage(context.chatId, 'Enter short description');
			return;
		}
		try {
			const category = this.state.params.get('category');
			const amount = this.state.params.get('amount');
			await new SpendingsRepository().create(category, amount, message.text);
			const msg = `Spending in category ${category} with amount ${amount} has been successfully created`;
			logger.success(msg);
			await bot.sendMessage(context.chatId, `✅ ${msg}`);
		} catch (err) {
			logger.error(`[${basename(__filename)}]: Unexpected error occurred while creating spending: ${err}`);
			await bot.sendMessage(context.chatId, `Unexpected error occurred while creating spending: ${err}`);
		} finally {
			this.state.params.clear();
			globalHandler.finishCommand();
		}
	}

	async handlePoll(context: SpendingsContext, poll: Poll) {
		const selected = poll.options.filter(o => o.voter_count > 0).map(o => o.text);
		context.category = selected[0];
		this.handle(context, null, false);
	}

	private setCreateStep(current: string) {
		setActiveStep(current, this.state.createSteps);
	}
}

export const spendingsCommandsHandler = new SpendingsHandler();
