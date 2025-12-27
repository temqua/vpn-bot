import type { Message, Poll } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../contracts';
import { ExpenseCommand } from '../../enums';
import { ExpensesService } from './expenses.service';
import { ExpenseCreateContext, ExpensesContext } from './expenses.types';
import { ExpenseCategory } from '@prisma/client';

class ExpensesHandler implements ICommandHandler {
	constructor(private service: ExpensesService = new ExpensesService()) {}

	async handle(context: ExpensesContext, message: Message | null, start = false) {
		if (context.cmd === ExpenseCommand.Create) {
			this.service.create(context as ExpenseCreateContext, message, start);
		} else if (context.cmd === ExpenseCommand.List) {
			this.service.list(message as Message);
		} else if (context.cmd === ExpenseCommand.Delete) {
			this.service.delete(message as Message, context, start);
		} else {
			this.service.sum(context, message as Message);
		}
	}

	async handlePoll(context: ExpensesContext, poll: Poll) {
		const selected = poll.options.filter(o => o.voter_count > 0).map(o => o.text as ExpenseCategory);
		context.category = selected[0];
		this.handle(context, null, false);
	}
}

export const expensesCommandsHandler = new ExpensesHandler();
