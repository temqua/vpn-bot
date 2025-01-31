import type { Message } from 'node-telegram-bot-api';
import type { OutlineApiService } from './outline.api-service';
import { CommandScope, VPNKeyCommand, VPNProtocol } from '../../core/enums';
import bot from '../../core/bot';
import logger from '../../core/logger';
import type { KeysContext } from './keys.handler';
import { globalHandler } from '../../core/globalHandler';

export class OutlineService {
	constructor(private service: OutlineApiService) {}

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

	async delete(context: KeysContext, message: Message, start: boolean) {
		if (!start) {
			await bot.sendMessage(message.chat.id, 'Selected user id to delete: ' + context.id);
			await this.service.delete(message, context.id);
			globalHandler.finishCommand();
			return;
		}
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
