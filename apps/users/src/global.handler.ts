import type { Message, Poll } from 'node-telegram-bot-api';
import { expensesCommandsHandler, type ExpensesContext } from './entities/expenses/handler';
import { userCommandsHandler } from './entities/users/users.handler';
import type { ICommandHandler } from './contracts';
import { CommandScope } from './enums';
import logger from './logger';
import { paymentsCommandsHandler, type PaymentsContext } from './entities/payments/payments.handler';
import { plansCommandsHandler, PlansContext } from './entities/plans/plans.handler';
import { UsersContext } from './entities/users/users.types';

export type CommandDetails = {
	processing?: boolean;
	scope: CommandScope;
	context: CommandContext;
} | null;

export type CommandDetailCompressed = {
	p?: number;
	s: CommandScope;
	c: CommandContext;
};

export type CommandContext = UsersContext | ExpensesContext | PaymentsContext | PlansContext;
class GlobalHandler {
	private activeCommand: CommandDetails = null;

	hasActiveCommand() {
		return Boolean(this.activeCommand);
	}

	finishCommand() {
		logger.log(`(${this.activeCommand?.scope ?? 'unknown'}): Finished ${this.activeCommand?.context?.cmd} command`);
		this.activeCommand = null;
	}

	async handlePoll(poll: Poll) {
		if (!this.activeCommand) {
			return;
		}
		logger.log(`(${this.activeCommand?.scope ?? 'unknown'}): Handling ${this.activeCommand?.context?.cmd} command`);
		if (this.activeCommand.scope === CommandScope.Expenses) {
			expensesCommandsHandler.handlePoll(this.activeCommand.context as ExpensesContext, poll);
		} else {
			userCommandsHandler.handlePoll(this.activeCommand.context as UsersContext, poll);
		}
	}

	async handleNewMessage(message: Message) {
		if (!this.activeCommand) {
			return;
		}
		logger.log(`(${this.activeCommand?.scope ?? 'unknown'}): Handling ${this.activeCommand?.context?.cmd} command`);
		let handler: ICommandHandler = userCommandsHandler;
		switch (this.activeCommand.scope) {
			case CommandScope.Users:
				handler = userCommandsHandler;
				break;
			case CommandScope.Payments:
				handler = paymentsCommandsHandler;
				break;
			case CommandScope.Plans:
				handler = plansCommandsHandler;
				break;
			default:
				handler = expensesCommandsHandler;
		}
		handler.handle(this.activeCommand.context, message);
	}

	async execute(command: CommandDetails, message: Message | undefined) {
		logger.log(`(${command?.scope ?? 'unknown'}): Executed ${command?.context?.cmd ?? 'unknown'} command`);
		this.activeCommand = command;
		let handler: ICommandHandler = userCommandsHandler;
		switch (this.activeCommand?.scope) {
			case CommandScope.Expenses:
				handler = expensesCommandsHandler;
				break;
			case CommandScope.Payments:
				handler = paymentsCommandsHandler;
				break;
			case CommandScope.Plans:
				handler = plansCommandsHandler;
				break;
			default:
				handler = userCommandsHandler;
		}
		handler.handle(this.activeCommand?.context, message, !command?.processing);
	}
}

export const globalHandler = new GlobalHandler();
