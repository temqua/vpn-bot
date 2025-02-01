import type { Message } from 'node-telegram-bot-api';
import { keysCommandsHandler, type KeysContext } from '../entities/keys/keys.handler';
import { userCommandsHandler, type UsersContext } from '../entities/users/users.handler';
import type { ICommandHandler } from './contracts';
import { CommandScope } from './enums';

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
		this.activeCommand = null;
	}

	async handleNewMessage(message: Message) {
		if (!this.activeCommand) {
			return;
		}
		const handler: ICommandHandler =
			this.activeCommand.scope === CommandScope.Keys ? keysCommandsHandler : userCommandsHandler;
		handler.handle(this.activeCommand.context, message);
	}

	async execute(command: CommandDetails, message: Message) {
		this.activeCommand = command;
		const handler: ICommandHandler =
			this.activeCommand.scope === CommandScope.Keys ? keysCommandsHandler : userCommandsHandler;
		handler.handle(this.activeCommand.context, message, !command.processing);
	}
}

export const globalHandler = new GlobalHandler();
