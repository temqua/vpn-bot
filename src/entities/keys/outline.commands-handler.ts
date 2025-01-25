import type { Message } from 'node-telegram-bot-api';
import bot from '../../core/bot';
import type { ICommandHandler } from '../../core/contracts';
import { CommandScope, VPNKeyCommand, VPNProtocol } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import logger from '../../core/logger';
import type { KeysContext } from './keys.commands-handler';
import { OutlineKeysService } from './outline-users';

class OutlineCommandsHandler implements ICommandHandler {
	constructor(private service: OutlineKeysService) {}
	private state = {
		firstStep: false,
	};
	async handle(context: KeysContext, message: Message, start = false) {
		this.state.firstStep = start;
		if (context.cmd === VPNKeyCommand.Create && start) {
			this.state.firstStep = false;
			await bot.sendMessage(message.chat.id, 'Enter username');
			return;
		}
		if (context.cmd === VPNKeyCommand.Delete) {
			await this.delete(context, message);
			return;
		}
		if (context.cmd === VPNKeyCommand.List) {
			await this.getAll(message);
		}
		if (context.cmd === VPNKeyCommand.GetUser) {
			await this.getUser(context, message);
		}
		if (context.cmd === VPNKeyCommand.Create) {
			await this.create(message, message.text);
		}
		globalHandler.finishCommand();
	}

	async create(message: Message, username: string) {
		await this.service.create(message, username);
	}

	async getAll(message: Message) {
		try {
			const users = await this.service.getAll(message);
			const buttons = users.accessKeys.map(({ name, id }) => [
				{
					text: name,
					callback_data: JSON.stringify({
						s: CommandScope.Keys,
						c: {
							cmd: VPNKeyCommand.GetUser,
							pr: VPNProtocol.Outline,
							id,
						},
						p: 1,
					}),
				},
			]);
			const inlineKeyboard = {
				reply_markup: {
					inline_keyboard: [...buttons],
				},
			};
			await bot.sendMessage(message.chat.id, 'Select user for additional info:', inlineKeyboard);
			logger.success('Outline users list was handled');
		} catch (error) {
			logger.error(`Outline users list fetching finished with error: ${error}`);
			await bot.sendMessage(message.chat.id, `Error while fetching Outline users: ${error}`);
		}
	}

	async delete(context: KeysContext, message: Message) {
		if (!this.state.firstStep) {
			await bot.sendMessage(message.chat.id, 'Selected user id to delete: ' + context.id);
			await this.service.delete(message, context.id);
			globalHandler.finishCommand();
			return;
		}
		this.state.firstStep = false;
		const users = await this.service.getAll(message);
		const buttons = users.accessKeys.map(({ name, id }) => [
			{
				text: name,
				callback_data: JSON.stringify({
					s: CommandScope.Keys,
					c: {
						cmd: VPNKeyCommand.Delete,
						pr: VPNProtocol.Outline,
						id,
					},
					p: 1,
				}),
			},
		]);
		const inlineKeyboard = {
			reply_markup: {
				inline_keyboard: [...buttons],
			},
		};
		await bot.sendMessage(message.chat.id, 'Select user to delete:', inlineKeyboard);
	}

	async getUser(context: KeysContext, message: Message) {
		try {
			const key = await this.service.getUser(message, context.id);
			if (!key) {
				throw new Error('Outline user fetch service returned null');
			}
			await bot.sendMessage(
				message.chat.id,
				`
		id: ${key.id}
		name: \`${key.name}\`
		password: \`${key.password}\`
		port: ${key.port}
		method: \`${key.method}\`
		accessUrl: \`${key.accessUrl}\``,
				{
					parse_mode: 'MarkdownV2',
				},
			);
		} catch (err) {
			logger.error(`Outline user ${context.id} fetching finished with error: ${err}`);
			await bot.sendMessage(message.chat.id, `Error while fetching outline user ${context.id}: ${err}`);
		}
	}
}

export const outlineCommandsHandler = new OutlineCommandsHandler(new OutlineKeysService());
