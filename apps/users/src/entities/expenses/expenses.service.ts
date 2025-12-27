import { ExpenseCategory } from '@prisma/client';
import { Message } from 'node-telegram-bot-api';
import { basename } from 'path';
import bot from '../../bot';
import { CmdCode, CommandScope, ExpenseCommand } from '../../enums';
import { globalHandler } from '../../global.handler';
import logger from '../../logger';
import pollOptions from '../../pollOptions';
import { formatDate, setActiveStep } from '../../utils';
import { ExpensesRepository } from './expenses.repository';
import { ExpenseCreateContext, ExpensesContext } from './expenses.types';

export class ExpensesService {
	constructor(private repository: ExpensesRepository = new ExpensesRepository()) {}
	params = new Map();
	createSteps = {
		category: false,
		amount: false,
		description: false,
	};
	async create(context: ExpenseCreateContext, message: Message | null, start = false) {
		this.log('create');
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
			this.params.set('amount', message?.text);
			this.setCreateStep('description');
			await bot.sendMessage(context.chatId, 'Enter short description');
			return;
		}
		try {
			const category = this.params.get('category');
			const amount = this.params.get('amount');
			await this.repository.create(category, amount, message?.text);
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
		this.log('list');
		const expenses = await this.repository.list();
		for (const expense of expenses) {
			await bot.sendMessage(
				message.chat.id,
				`\`${expense.id.replace(/[-.*#_]/g, match => `\\${match}`)} \`
Category: **${expense.category.replace(/[-.*#_]/g, match => `\\${match}`)}**
Date: ${formatDate(expense.paymentDate).replace(/[-.*#_]/g, match => `\\${match}`)} 
${expense.amount.toString().replace(/[-.*#_]/g, match => `\\${match}`)} ${expense.currency} 
Additional info: ${expense.description.replace(/[-.*#_]/g, match => `\\${match}`)}`,
				{
					parse_mode: 'MarkdownV2',
				},
			);
		}
		if (!expenses.length) {
			await bot.sendMessage(message.chat.id, `No expenses found`);
		}
		this.params.clear();
		globalHandler.finishCommand();
	}

	async sum(context: ExpensesContext, message: Message) {
		this.log('sum');
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

	async delete(msg: Message, context: ExpensesContext, start = false) {
		this.log('delete');
		if (!start) {
			await this.repository.delete(context.id);
			const message = `Expense with id ${context.id} has been successfully removed`;
			logger.success(`[${basename(__filename)}]: ${message}`);
			await bot.sendMessage(msg.chat.id, message);
			globalHandler.finishCommand();
			return;
		}
		const expenses = await this.repository.list();
		const buttons = expenses.map(({ description, id }) => [
			{
				text: description,
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Expenses,
					[CmdCode.Context]: {
						cmd: ExpenseCommand.Delete,
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
		await bot.sendMessage(msg.chat.id, 'Select expense to delete:', inlineKeyboard);
	}

	async sumNalogs(message: Message) {
		const result = await this.repository.sumNalogs();
		await bot.sendMessage(message.chat.id, `Sum of nalog expenses: ${result._sum.amount}`);
	}

	async sumServers(message: Message) {
		const result = await this.repository.sumServers();
		await bot.sendMessage(message.chat.id, `Sum of server expenses: ${result._sum.amount}`);
	}

	private setCreateStep(current: string) {
		setActiveStep(current, this.createSteps);
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
}
