import type { Message, Poll } from 'node-telegram-bot-api';
import { basename } from 'path';
import { setActiveStep } from '../../core';
import bot from '../../core/bot';
import type { ICommandHandler } from '../../core/contracts';
import { CmdCode, ExpenseCommand } from '../../core/enums';
import { globalHandler } from '../../core/global.handler';
import logger from '../../core/logger';
import pollOptions from '../../core/pollOptions';
import { ExpensesRepository } from './repository';
import { ExpenseCategory } from '@prisma/client';

export interface ExpensesContext {
	category?: ExpenseCategory;
	amount?: number;
	chatId?: number;
	[CmdCode.Command]: ExpenseCommand;
}

class ExpensesHandler implements ICommandHandler {
	constructor(private repository: ExpensesRepository = new ExpensesRepository()) {}
	params = new Map();
	createSteps = {
		category: false,
		amount: false,
		description: false,
	};

	async handle(context: ExpensesContext, message: Message, start = false) {
		if (context.cmd === ExpenseCommand.Create) {
			this.create(context, message, start);
		} else if (context.cmd === ExpenseCommand.List) {
			this.list(message);
		} else {
			this.sum(context, message);
		}
	}

	async create(context: ExpensesContext, message: Message, start = false) {
		context.chatId = message?.chat?.id ?? context.chatId;
		if (start) {
			this.setCreateStep('category');
			if (!context.category) {
				await bot.sendPoll(context.chatId, 'Choose expense category', pollOptions.expenseCategories, {
					allows_multiple_answers: false,
				});
				return;
			}
		}
		if (this.createSteps.category) {
			this.params.set('category', context.category);
			this.setCreateStep('amount');
			await bot.sendMessage(context.chatId, 'Enter expense amount');
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
			const msg = `Expense in category ${category} with amount ${amount} has been successfully created`;
			logger.success(msg);
			await bot.sendMessage(context.chatId, `✅ ${msg}`);
		} catch (err) {
			logger.error(`[${basename(__filename)}]: Unexpected error occurred while creating expense: ${err}`);
			await bot.sendMessage(context.chatId, `Unexpected error occurred while creating expense: ${err}`);
		} finally {
			this.params.clear();
			globalHandler.finishCommand();
		}
	}

	async list(message: Message) {
		const expenses = await this.repository.list();
		for (const expense of expenses) {
			await bot.sendMessage(
				message.chat.id,
				`Found expense ${expense.id} in category ${expense.category} at ${expense.paymentDate}. ${expense.amount} ${expense.currency}. Additional info: ${expense.description}`,
			);
		}
		if (!expenses.length) {
			await bot.sendMessage(message.chat.id, `No expenses found`);
		}
		this.params.clear();
		globalHandler.finishCommand();
	}

	async sum(context: ExpensesContext, message: Message) {
		if (context.category) {
			if (context.category === ExpenseCategory.Nalog) {
				await this.sumNalogs(message);
			} else {
				await this.sumServers(message);
			}
			this.params.clear();
			globalHandler.finishCommand();
			return;
		}
		const result = await this.repository.sum();

		await bot.sendMessage(message.chat.id, `Sum of expenses: ${result._sum.amount}`);
		this.params.clear();
		globalHandler.finishCommand();
	}

	async sumNalogs(message: Message) {
		const result = await this.repository.sumNalogs();
		await bot.sendMessage(message.chat.id, `Sum of nalog expenses: ${result._sum.amount}`);
	}

	async sumServers(message: Message) {
		const result = await this.repository.sumServers();
		await bot.sendMessage(message.chat.id, `Sum of server expenses: ${result._sum.amount}`);
	}

	async handlePoll(context: ExpensesContext, poll: Poll) {
		const selected = poll.options.filter(o => o.voter_count > 0).map(o => o.text);
		context.category = selected[0];
		this.handle(context, null, false);
	}

	private setCreateStep(current: string) {
		setActiveStep(current, this.createSteps);
	}
}

export const expensesCommandsHandler = new ExpensesHandler();
