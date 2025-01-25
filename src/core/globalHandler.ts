import type { Message } from 'node-telegram-bot-api';
import type { CommandContext } from '../interaction-handlers';
import * as allHandlers from '../interaction-handlers';
import { CommandScope } from './enums';
import logger from './logger';

export type CommandDetails = {
	processing: boolean;
	scope: CommandScope;
	context: CommandContext;
} | null;

const handlers = {
	...allHandlers.default,
};

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
		const handler = handlers[this.activeCommand.scope];
		if (handler) {
			handler.handle(this.activeCommand.context, message);
		} else {
			logger.error(`handler for scope ${this.activeCommand.scope} is undefined`);
		}
	}

	async execute(command: CommandDetails, message: Message) {
		this.activeCommand = command;
		const handler = handlers[this.activeCommand.scope];
		if (handler) {
			handler.handle(this.activeCommand.context, message, !command.processing);
		} else {
			logger.error(`handler for scope ${this.activeCommand.scope} is undefined`);
		}
	}
}

export const globalHandler = new GlobalHandler();
