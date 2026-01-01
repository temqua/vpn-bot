import { ExpenseCategory } from '@prisma/client';
import type { CallbackQuery, Message, Poll, User } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../contracts';
import { CmdCode, ExpenseCommand } from '../../enums';
import { ExpensesService } from './expenses.service';
import { ExpenseCreateContext, ExpensesContext } from './expenses.types';

class ExpensesHandler implements ICommandHandler {
	constructor(private service: ExpensesService = new ExpensesService()) {}

	handle(context: ExpensesContext, message: Message | null, from: User, start = false) {
		if (context[CmdCode.Command] === ExpenseCommand.Create) {
			this.service.create(context as ExpenseCreateContext, message, start);
		} else if (context[CmdCode.Command] === ExpenseCommand.List) {
			this.service.list(message as Message);
		} else if (context[CmdCode.Command] === ExpenseCommand.Delete) {
			this.service.delete(message as Message, context, start);
		} else {
			this.service.sum(context, message as Message);
		}
	}

	handleQuery(context: ExpensesContext, query: CallbackQuery, start = false) {
		this.handle(context, query.message, query.from, start);
	}

	handlePoll(context: ExpensesContext, poll: Poll) {
		const selected = poll.options.filter(o => o.voter_count > 0).map(o => o.text as ExpenseCategory);
		context.category = selected[0];
		this.handle(context, null, null, false);
	}
}

export const expensesCommandsHandler = new ExpensesHandler();
