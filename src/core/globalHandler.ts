import type { Message, Poll } from 'node-telegram-bot-api';
import { keysCommandsHandler, type KeysContext } from '../entities/keys/keys.handler';
import { userCommandsHandler, type UsersContext } from '../entities/users/users.handler';
import type { ICommandHandler } from './contracts';
import { CommandScope } from './enums';
import logger from './logger';

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

export type CommandContext = UsersContext | KeysContext;
class GlobalHandler {
	private activeCommand: CommandDetails = null;

	hasActiveCommand() {
		return Boolean(this.activeCommand);
	}

	finishCommand() {
		logger.log(`(${this.activeCommand?.scope ?? 'unknown'}): Finished ${this.activeCommand.context.cmd} command`);
		this.activeCommand = null;
	}

	async handlePoll(poll: Poll) {
		if (!this.activeCommand) {
			return;
		}
		logger.log(`(${this.activeCommand?.scope ?? 'unknown'}): Handling ${this.activeCommand.context.cmd} command`);
		userCommandsHandler.handlePoll(this.activeCommand.context as UsersContext, poll);
	}

	async handleNewMessage(message: Message) {
		if (!this.activeCommand) {
			return;
		}
		logger.log(`(${this.activeCommand?.scope ?? 'unknown'}): Handling ${this.activeCommand.context.cmd} command`);
		const handler: ICommandHandler =
			this.activeCommand.scope === CommandScope.Keys ? keysCommandsHandler : userCommandsHandler;
		handler.handle(this.activeCommand.context, message);
	}

	async execute(command: CommandDetails, message: Message) {
		logger.log(`(${command?.scope ?? 'unknown'}): Executed ${command.context.cmd} command`);
		this.activeCommand = command;
		const handler: ICommandHandler =
			this.activeCommand.scope === CommandScope.Keys ? keysCommandsHandler : userCommandsHandler;
		handler.handle(this.activeCommand.context, message, !command.processing);
	}
}

export const globalHandler = new GlobalHandler();
