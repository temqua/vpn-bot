import type { Message, Poll } from 'node-telegram-bot-api';
import { keysCommandsHandler, type KeysContext } from '../entities/keys/keys.handler';
import { expensesCommandsHandler, type ExpensesContext } from '../entities/expenses/handler';
import { userCommandsHandler, type UsersContext } from '../entities/users/users.handler';
import type { ICommandHandler } from './contracts';
import { CommandScope } from './enums';
import logger from './logger';
import { paymentsCommandsHandler, type PaymentsContext } from '../entities/payments/payments.handler';

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

export type CommandContext = UsersContext | KeysContext | ExpensesContext | PaymentsContext;
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
		let handler: ICommandHandler = keysCommandsHandler;
		switch (this.activeCommand.scope) {
			case CommandScope.Users:
				handler = userCommandsHandler;
				break;
			case CommandScope.Keys:
				handler = keysCommandsHandler;
				break;
			case CommandScope.Payments:
				handler = paymentsCommandsHandler;
				break;
			default:
				handler = expensesCommandsHandler;
		}
		handler.handle(this.activeCommand.context, message);
	}

	async execute(command: CommandDetails, message: Message) {
		logger.log(`(${command?.scope ?? 'unknown'}): Executed ${command?.context?.cmd} command`);
		this.activeCommand = command;
		let handler: ICommandHandler = keysCommandsHandler;
		switch (this.activeCommand.scope) {
			case CommandScope.Users:
				handler = userCommandsHandler;
				break;
			case CommandScope.Keys:
				handler = keysCommandsHandler;
				break;
			case CommandScope.Payments:
				handler = paymentsCommandsHandler;
				break;
			default:
				handler = expensesCommandsHandler;
		}
		handler.handle(this.activeCommand.context, message, !command.processing);
	}
}

export const globalHandler = new GlobalHandler();
