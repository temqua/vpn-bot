import https from 'https';
import type { Message } from 'node-telegram-bot-api';
import bot from '../../core/bot';
import type { IKeysService } from '../../core/contracts';
import logger from '../../core/logger';
import env from '../../env';

export type OutlineResponse = {
	accessKeys: OutlineKey[];
};

export type OutlineKey = {
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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export class OutlineApiService implements IKeysService {
	private formatUserInfo(key: OutlineKey) {
		return `
id: ${key.id}
username: \`${key.name}\`
accessUrl: \`${key.accessUrl}\`
`;
	}

	async getAll(message: Message): Promise<OutlineResponse | null> {
		const response = await fetch(`${env.OUTLINE_API_ROOT}/access-keys`, {
			dispatcher: httpsAgent,
		});
		if (!response.ok) {
			await bot.sendMessage(
				message.chat.id,
				`Error while fetching Outline users: ${response.status} ${response.statusText}`,
			);
			logger.error(`Outline users list fetching finished with error: ${response.status} ${response.statusText}`);
			return null;
		}
		return await response.json();
	}

	async getUser(message: Message, id: string): Promise<OutlineKey | null> {
		const response = await fetch(`${env.OUTLINE_API_ROOT}/access-keys/${id}`, {
			dispatcher: httpsAgent,
		});
		if (!response.ok) {
			await bot.sendMessage(
				message.chat.id,
				`Error while fetching outline user ${id}: ${response.status} ${response.statusText}`,
			);
			logger.error(`Outline user ${id} fetching finished with error: ${response.status} ${response.statusText}`);
			return null;
		}
		return await response.json();
	}

	async create(message: Message, username: string) {
		try {
			const response = await fetch(`${env.OUTLINE_API_ROOT}/access-keys`, {
				method: 'POST',
				body: JSON.stringify({
					name: username,
				}),
				headers: {
					'Content-Type': 'application/json',
				},
				dispatcher: httpsAgent,
			});
			if (!response.ok) {
				await bot.sendMessage(
					message.chat.id,
					`Outline user ${username} was not created correctly: ${response.status} ${response.statusText}`,
				);
				return;
			}
			const key: OutlineKey = await response.json();
			if (key?.id) {
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
				logger.success(`Outline user ${username} has been successfully created`);
			} else {
				const errorMessage = `Outline user ${username} was not created correctly`;
				logger.error(errorMessage);
				await bot.sendMessage(message.chat.id, errorMessage);
			}
		} catch (error) {
			logger.error(`Outline user ${username} was not created correctly`);
			logger.error(error);
			await bot.sendMessage(message.chat.id, `Outline user ${username} was not created correctly ${error}`);
		}
	}

	async delete(message: Message, id: string) {
		try {
			const response = await fetch(`${env.OUTLINE_API_ROOT}/access-keys/${id}`, {
				method: 'DELETE',
				dispatcher: httpsAgent,
			});
			if (!response.ok) {
				await bot.sendMessage(
					message.chat.id,
					`Outline user ${id} was not deleted correctly: ${response.status} ${response.statusText}`,
				);
				return;
			}
			const successMessage = `Outline user ${id} has been successfully deleted`;
			logger.success(successMessage);
			await bot.sendMessage(message.chat.id, successMessage);
		} catch (error) {
			logger.error(`Outline user ${id} was not deleted correctly: ${error}`);
			await bot.sendMessage(message.chat.id, `Outline user ${id} was not deleted correctly ${error}`);
		}
	}
}
