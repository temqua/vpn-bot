import type { Message } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../core/contracts';
import { VPNKeyCommand, VPNProtocol } from '../core/enums';
import { keysService } from '../services/keys';
import bot from '../services/bot';
import { globalHandler } from '../core/globalHandler';

export type KeysContext = {
	protocol: VPNProtocol;
	command: VPNKeyCommand;
};

class KeysCommandsHandler implements ICommandHandler {
	private state = {
		params: new Map(),
		firstStep: false,
	};

	async handle(context: KeysContext, message: Message, start = false) {
		this.state.firstStep = start;
		if (context?.command === VPNKeyCommand.Create) {
			await this.create(context, message);
		} else if (context?.command === VPNKeyCommand.Delete) {
			await this.delete(context, message);
		} else if (context?.command === VPNKeyCommand.GetFile) {
			await this.getFile(context, message);
		} else {
			await this.list(context, message);
		}
	}

	async list(context: KeysContext, message: Message) {
		await keysService.getAll(message, context.protocol);
		globalHandler.finishCommand();
	}

	async create(context: KeysContext, message: Message) {
		if (this.state.firstStep) {
			await bot.sendMessage(message.chat.id, 'Enter new username');
			this.state.firstStep = false;
		} else if (!this.state.params.has('username')) {
			this.state.params.set('username', message.text);
			await keysService.create(message, this.state.params.get('username'), context.protocol);
			this.state.params.clear();
			globalHandler.finishCommand();
		}
	}

	async delete(context: KeysContext, message: Message) {
		if (context.protocol === VPNProtocol.Outline) {
			this.deleteOutline(context, message);
			return;
		}
		if (this.state.firstStep) {
			await bot.sendMessage(message.chat.id, 'Enter username to delete');
			this.state.firstStep = false;
		} else if (!this.state.params.has('username')) {
			this.state.params.set('username', message.text);
			await keysService.delete(message, this.state.params.get('username'), context.protocol);
			this.state.params.clear();
			globalHandler.finishCommand();
		}
	}

	async getFile(context: KeysContext, message: Message) {
		if (context.protocol === VPNProtocol.Outline) {
			return;
		}
		if (this.state.firstStep) {
			await bot.sendMessage(message.chat.id, 'Enter username');
			this.state.firstStep = false;
		} else if (!this.state.params.has('username')) {
			this.state.params.set('username', message.text);
			await keysService.getFile(message, this.state.params.get('username'), context.protocol);
			this.state.params.clear();
			globalHandler.finishCommand();
		}
	}

	async deleteOutline(context: KeysContext, message: Message) {
		if (this.state.firstStep) {
			await bot.sendMessage(message.chat.id, 'Enter user id to delete');
			this.state.firstStep = false;
		} else if (!this.state.params.has('id')) {
			this.state.params.set('id', message.text);
			await keysService.delete(message, this.state.params.get('id'), context.protocol);
			this.state.params.clear();
			globalHandler.finishCommand();
		}
	}
}

export const keysCommandsHandler = new KeysCommandsHandler();
