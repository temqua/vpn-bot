import type { Message } from 'node-telegram-bot-api';
import bot from '../../../core/bot';
import { getOutlineOperations } from '../../../core/buttons';
import client from '../../../core/client';
import logger from '../../../core/logger';
import env from '../../../env';
import type {
	OutlineKey,
	OutlineMetricsTransfer,
	OutlineResponse,
	OutlineServerMetricsResponse,
} from './outline.types';

export class OutlineApiService {
	private formatUserInfo(key: OutlineKey) {
		return `
id: ${key.id}
username: \`${key.name}\`
accessUrl: \`${key.accessUrl}\`
`;
	}

	async getAll(chatId: number): Promise<OutlineResponse | null> {
		const response = await client.get(`${env.OUTLINE_API_ROOT}/access-keys`);
		if (!response.ok) {
			await bot.sendMessage(
				chatId,
				`Error while fetching Outline users: ${response.status} ${response.statusText}`,
			);
			logger.error(`Outline users list fetching finished with error: ${response.status} ${response.statusText}`);
			return null;
		}
		return await response.json();
	}

	async getUser(id: string, chatId: number): Promise<OutlineKey | null> {
		const response = await client.get(`${env.OUTLINE_API_ROOT}/access-keys/${id}`);
		if (!response.ok) {
			await bot.sendMessage(
				chatId,
				`Error while fetching outline user ${id}: ${response.status} ${response.statusText}`,
			);
			logger.error(`Outline user ${id} fetching finished with error: ${response.status} ${response.statusText}`);
			return null;
		}
		return await response.json();
	}

	async getTransferredMetrics(chatId: number): Promise<OutlineMetricsTransfer> {
		const response = await client.get(`${env.OUTLINE_API_ROOT}/metrics/transfer`);
		if (!response.ok) {
			const errMsg = `Error while fetching outline users transfer metrics: ${response.status} ${response.statusText}`;
			await bot.sendMessage(chatId, errMsg);
			logger.error(errMsg);
			return null;
		}
		return await response.json();
	}

	async create(message: Message, username: string) {
		try {
			const response = await client.post(`${env.OUTLINE_API_ROOT}/access-keys`, {
				body: JSON.stringify({
					name: username,
				}),
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
					`id: ${key.id}
name: \`${key.name}\`
password: \`${key.password}\`
port: ${key.port}
method: \`${key.method}\`
accessUrl: \`${key.accessUrl}\``,
					{
						parse_mode: 'MarkdownV2',
					},
				);
				await bot.sendMessage(message.chat.id, 'Available operations', getOutlineOperations(key.id));

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

	async delete(id: string, chatId: number) {
		try {
			const response = await client.delete(`${env.OUTLINE_API_ROOT}/access-keys/${id}`);
			if (!response.ok) {
				await bot.sendMessage(
					chatId,
					`Outline user ${id} was not deleted correctly: ${response.status} ${response.statusText}`,
				);
				return;
			}
			const successMessage = `Outline user ${id} has been successfully deleted`;
			logger.success(successMessage);
			await bot.sendMessage(chatId, successMessage);
		} catch (error) {
			const errMsg = `Outline user ${id} was not deleted correctly: ${error}`;
			logger.error(errMsg);
			await bot.sendMessage(chatId, errMsg);
		}
	}

	async rename(id: string, chatId: number, username: string) {
		try {
			const response = await client.put(`${env.OUTLINE_API_ROOT}/access-keys/${id}/name`, {
				body: JSON.stringify({
					name: username,
				}),
			});
			if (!response.ok) {
				await bot.sendMessage(
					chatId,
					`Outline user ${id} was not renamed correctly: ${response.status} ${response.statusText}`,
				);
				return;
			}
		} catch (err) {
			const errMsg = `Outline user ${id} was not renamed correctly: ${err}`;
			logger.error(errMsg);
			await bot.sendMessage(chatId, errMsg);
		}
	}

	async setDataLimit(id: string, chatId: number, dataLimit: number) {
		try {
			const response = await client.put(`${env.OUTLINE_API_ROOT}/access-keys/${id}/data-limit`, {
				body: JSON.stringify({
					limit: {
						bytes: dataLimit,
					},
				}),
			});
			if (!response.ok) {
				await bot.sendMessage(
					chatId,
					`Outline user ${id} data limit was not set correctly: ${response.status} ${response.statusText}`,
				);
				return;
			}
			const successMessage = `Outline user ${id} data limit has been successfully set to ${dataLimit / (1024 * 1024 * 1024)} GB`;
			logger.success(successMessage);
			await bot.sendMessage(chatId, successMessage);
		} catch (error) {
			const errMsg = `Outline user ${id} data limit was not set correctly: ${error}`;
			logger.error(errMsg);
			await bot.sendMessage(chatId, errMsg);
		}
	}

	async removeDataLimit(id: string, chatId: number) {
		try {
			const response = await client.delete(`${env.OUTLINE_API_ROOT}/access-keys/${id}/data-limit`);
			if (!response.ok) {
				await bot.sendMessage(
					chatId,
					`Outline user ${id} data limit was not removed correctly: ${response.status} ${response.statusText}`,
				);
				return;
			}
			const successMessage = `Outline user ${id} data limit has been successfully removed`;
			logger.success(successMessage);
			await bot.sendMessage(chatId, successMessage);
		} catch (error) {
			const errMsg = `Outline user ${id} data limit was not removed correctly: ${error}`;
			logger.error(errMsg);
			await bot.sendMessage(chatId, errMsg);
		}
	}

	async getMetrics(): Promise<OutlineServerMetricsResponse> {
		const response = await client.get(`${env.OUTLINE_API_ROOT}/experimental/server/metrics?since=1d`);
		if (!response.ok) {
			throw new Error(
				`Error while fetching experimental server metrics: ${response.status} ${response.statusText}`,
			);
		}
		return await response.json();
	}
}
