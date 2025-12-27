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
