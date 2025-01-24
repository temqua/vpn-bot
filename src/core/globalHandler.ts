import type { Message } from 'node-telegram-bot-api';
import { CommandScope } from './enums';
import type { CommandContext } from '../interactions';
import { keysCommandsHandler, type KeysContext } from '../interactions/keys';
import { userCommandsHandler, type UsersContext } from '../interactions/user';

export type CommandDetails = {
	scope: CommandScope;
	context: CommandContext;
} | null;

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
		if (this.activeCommand.scope === CommandScope.Users) {
			userCommandsHandler.handle(this.activeCommand.context as UsersContext, message);
		}
		if (this.activeCommand.scope === CommandScope.Keys) {
			keysCommandsHandler.handle(this.activeCommand.context as KeysContext, message);
		}
	}

	async execute(command: CommandDetails, message: Message) {
		this.activeCommand = command;
		if (command.scope === CommandScope.Users) {
			userCommandsHandler.handle(command.context as UsersContext, message, true);
		}
		if (this.activeCommand.scope === CommandScope.Keys) {
			keysCommandsHandler.handle(command.context as KeysContext, message, true);
		}
	}
}

export const globalHandler = new GlobalHandler();
