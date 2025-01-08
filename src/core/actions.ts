import type { Message } from 'node-telegram-bot-api';
import { VPNCommand, VPNProtocol } from '../core/enums';
import { userService } from '../services/user';
import bot from '../services/bot';
import { paymentsService } from '../services/payments';
import logger from './logger';

export type ActionInfo = {
	command: VPNCommand;
	protocol: VPNProtocol;
} | null;

class BotActions {
	#action: ActionInfo = null;
	#state = {
		params: new Map(),
		start: false,
	};

	async list(message: Message) {
		await userService.getAll(message, this.#action.protocol);
		this.#action = null;
	}

	async create(message: Message) {
		if (this.#state.start) {
			await bot.sendMessage(message.chat.id, 'Enter new username');
			this.#state.start = false;
		} else if (!this.#state.params.has('username')) {
			this.#state.params.set('username', message.text);
			await userService.create(message, this.#state.params.get('username'), this.#action.protocol);
			this.#state.params.clear();
			this.#action = null;
		}
	}

	async delete(message: Message) {
		if (this.#action?.protocol === VPNProtocol.Outline) {
			this.deleteOutline(message);
			return;
		}
		if (this.#state.start) {
			await bot.sendMessage(message.chat.id, 'Enter username to delete');
			this.#state.start = false;
		} else if (!this.#state.params.has('username')) {
			this.#state.params.set('username', message.text);
			await userService.delete(message, this.#state.params.get('username'), this.#action.protocol);
			this.#state.params.clear();
			this.#action = null;
		}
	}

	async getFile(message: Message) {
		if (this.#action?.protocol === VPNProtocol.Outline) {
			return;
		}
		if (this.#state.start) {
			await bot.sendMessage(message.chat.id, 'Enter username');
			this.#state.start = false;
		} else if (!this.#state.params.has('username')) {
			this.#state.params.set('username', message.text);
			await userService.getFile(message, this.#state.params.get('username'), this.#action.protocol);
			this.#state.params.clear();
			this.#action = null;
		}
	}

	async deleteOutline(message: Message) {
		if (this.#state.start) {
			await bot.sendMessage(message.chat.id, 'Enter user id to delete');
			this.#state.start = false;
		} else if (!this.#state.params.has('id')) {
			this.#state.params.set('id', message.text);
			await userService.delete(message, this.#state.params.get('id'), this.#action.protocol);
			this.#state.params.clear();
			this.#action = null;
		}
	}

	async pay(msg: Message) {
		if (msg.user_shared) {
			await paymentsService.pay(msg);
			logger.log(`Request ID: ${msg.user_shared.request_id}, ${msg.user_shared.user_id}`);
			await bot.sendMessage(msg.chat.id, `Request ID: ${msg.user_shared.request_id}, ${msg.user_shared.user_id}`);
		}
	}

	hasAction() {
		return Boolean(this.#action);
	}

	async handleMessage(message: Message) {
		if (!this.#action) {
			return;
		}
		if (this.#action?.command === VPNCommand.Create) {
			await this.create(message);
		}
		if (this.#action?.command === VPNCommand.Delete) {
			await this.delete(message);
		}
	}

	async execute(action: ActionInfo, message: Message) {
		this.#action = action;
		this.#state.start = true;
		if (action.command === VPNCommand.Create) {
			await this.create(message);
		} else if (action.command === VPNCommand.Delete) {
			await this.delete(message);
		} else {
			await this.list(message);
		}
	}
}

export const actions = new BotActions();
