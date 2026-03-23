import { ExpenseCategory } from '@prisma/client';
import { CmdCode, ExpenseCommand } from '../../enums';

export interface ExpensesContext {
	category?: ExpenseCategory;
	amount?: number;
	chatId?: number;
	[CmdCode.Command]: ExpenseCommand;
	id?: string;
}

export interface ExpenseCreateContext extends ExpensesContext {
	chatId: number;
}

export interface CreateExpenseDto {
	category: ExpenseCategory;

	amount: number;

	description?: string;
}

export interface ExpenseSumDto {
	amount: string;
}
