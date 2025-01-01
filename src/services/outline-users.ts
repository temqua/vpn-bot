import type { Message } from 'node-telegram-bot-api';
import { OUTLINE_API_ROOT } from '../env';
import bot from './bot';
import logger from './logger';
import type { IProtocolService } from '../core';
import https from 'https';

type OutlineResponse = {
	accessKeys: OutlineKey[];
};

type OutlineKey = {
	id: string;
	name: string;
	password: string;
	port: number;
	method: string;
	accessUrl: string;
};

const httpsAgent = new https.Agent({
	rejectUnauthorized: false, // Ignore self-signed certificates
});

// const originalFetch = fetch;/
// global.fetch = (input, init = {}) => {
// 	if (typeof input === 'string' && input.startsWith('https:')) {
// 		init.dispatcher = httpsAgent;
// 	}
// 	return originalFetch(input, init);
// };

export class OutlineUsersService implements IProtocolService {
	private formatUserInfo(key: OutlineKey) {
		return `\`\`\`
id: ${key.id}
username: ${key.name}
accessUrl: ${key.accessUrl}
            \`\`\``;
	}

	async getAll(message: Message) {
		try {
			const response = await fetch(`${OUTLINE_API_ROOT}/access-keys`, {
				dispatcher: httpsAgent,
			});
			if (!response.ok) {
				await bot.sendMessage(
					message.chat.id,
					`Error while fetching Outline users: ${response.status} ${response.statusText}`,
				);
				logger.error(
					`Outline users list fetching finished with error: ${response.status} ${response.statusText}`,
				);
				return;
			}
			const data: OutlineResponse = await response.json();
			for (const key of data.accessKeys) {
				await bot.sendMessage(message.chat.id, this.formatUserInfo(key), {
					parse_mode: 'MarkdownV2',
				});
			}

			logger.success('Outline users list was handled');
		} catch (error) {
			logger.error(`Outline users list fetching finished with error: ${error}`);
			await bot.sendMessage(message.chat.id, `Error while fetching Outline users: ${error}`);
		}
	}

	async create(message: Message, username: string) {
		try {
			const response = await fetch(`${OUTLINE_API_ROOT}/access-keys`, {
				method: 'POST',
				body: JSON.stringify({
					name: username,
				}),
				dispatcher: httpsAgent,
			});
			if (!response.ok) {
				await bot.sendMessage(
					message.chat.id,
					`Outline user was not created correctly: ${response.status} ${response.statusText}`,
				);
				return;
			}
			const key: OutlineKey = await response.json();
			if (key?.id) {
				await bot.sendMessage(
					message.chat.id,
					`\`\`\`
            id: ${key.id}
            username: ${key.name}
            password: ${key.password}
            port: ${key.port}
            method: ${key.method}
            accessUrl: ${key.accessUrl}
                                \`\`\``,
					{
						parse_mode: 'MarkdownV2',
					},
				);
				logger.success('Outline user was successfully created');
			} else {
				const errorMessage = 'Outline user was not created correctly';
				logger.error(errorMessage);
				await bot.sendMessage(message.chat.id, errorMessage);
			}
		} catch (error) {
			logger.error('Outline user was not created correctly');
			logger.error(error);
			await bot.sendMessage(message.chat.id, 'Outline user was not created correctly');
			await bot.sendMessage(message.chat.id, error);
		}
	}

	async delete(message: Message, id: string) {
		try {
			const response = await fetch(`${OUTLINE_API_ROOT}/access-keys/${id}`, {
				method: 'DELETE',
				dispatcher: httpsAgent,
			});
			if (!response.ok) {
				await bot.sendMessage(
					message.chat.id,
					`Outline user was not deleted correctly: ${response.status} ${response.statusText}`,
				);
				return;
			}
		} catch (error) {
			logger.error('Outline user was not deleted correctly');
			logger.error(error);
			await bot.sendMessage(message.chat.id, 'Outline user was not deleted correctly');
			await bot.sendMessage(message.chat.id, error);
		}
	}
}
