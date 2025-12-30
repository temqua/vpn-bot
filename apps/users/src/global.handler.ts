import type { Message, Poll } from 'node-telegram-bot-api';
import type { ICommandHandler } from './contracts';
import { expensesCommandsHandler } from './entities/expenses/expenses.handler';
import type { ExpensesContext } from './entities/expenses/expenses.types';
import { paymentsCommandsHandler } from './entities/payments/payments.handler';
import type { PaymentsContext } from './entities/payments/payments.types';
import { plansCommandsHandler } from './entities/plans/plans.handler';
import type { PlansContext } from './entities/plans/plans.types';
import { serversCommandsHandler } from './entities/servers/servers.handler';
import type { ServersContext } from './entities/servers/servers.types';
import { userCommandsHandler } from './entities/users/users.handler';
import type { UsersContext } from './entities/users/users.types';
import { CommandScope } from './enums';
import logger from './logger';
import TelegramBot from 'node-telegram-bot-api';

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

export type CommandContext = UsersContext | ExpensesContext | PaymentsContext | PlansContext | ServersContext;
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
			case CommandScope.Servers:
				handler = serversCommandsHandler;
				break;
			default:
				handler = expensesCommandsHandler;
		}
		handler.handle(this.activeCommand.context, message, message.from);
	}

	async execute(command: CommandDetails, query: TelegramBot.CallbackQuery) {
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
			case CommandScope.Servers:
				handler = serversCommandsHandler;
				break;
			default:
				handler = userCommandsHandler;
		}
		handler.handleQuery(this.activeCommand?.context, query, !command?.processing);
	}
}

export const globalHandler = new GlobalHandler();
