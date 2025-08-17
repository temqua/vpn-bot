import type { Message, SendBasicOptions } from 'node-telegram-bot-api';
import { basename } from 'path';
import bot from '../../../bot';
import { getOutlineOperations, outlineDeleteKeyboard, outlineListKeyboard } from '../../../buttons';
import { CmdCode, CommandScope, VPNKeyCommand, VPNProtocol } from '../../../enums';
import { globalHandler } from '../../../global.handler';
import logger from '../../../logger';
import type { KeysContext } from '../keys.handler';
import { OutlineApiService } from './outline.api-service';

export class OutlineService {
	constructor(private service: OutlineApiService = new OutlineApiService()) {}

	deleteSteps = {
		delete: false,
	};

	async create(message: Message, username: string) {
		this.log('create');
		await this.service.create(message, username);
	}

	async getAll(context: KeysContext, message: Message, start: boolean) {
		this.log('getAll');

		if (start) {
			await bot.sendMessage(
				message.chat.id,
				'Send start of username for user searching or click on the button to show all users',
				outlineListKeyboard,
			);
			return;
		}

		try {
			const users = await this.service.getAll(message.chat.id);
			const keys = context.accept
				? users.accessKeys
				: users.accessKeys.filter(({ name }) => name.startsWith(message.text));
			if (!keys.length) {
				await bot.sendMessage(message.chat.id, 'No outline users found for your request');
				await bot.sendMessage(message.chat.id, `Total count ${users.accessKeys.length}`);
				logger.success(`[${basename(__filename)}]: Outline users list was handled`);
				globalHandler.finishCommand();
				return;
			}
			const buttons = keys.map(({ name, id }) => [
				{
					text: name,
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Keys,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNKeyCommand.GetUser,
							[CmdCode.Protocol]: VPNProtocol.Outline,
							id,
						},
						[CmdCode.Processing]: 1,
					}),
				},
			]);
			const chunkSize = 50;
			const chunksCount = Math.ceil(buttons.length / chunkSize);
			for (let i = 0; i < chunksCount; i++) {
				const chunk = buttons.slice(i * chunkSize, i * chunkSize + chunkSize);
				const inlineKeyboard: SendBasicOptions = {
					reply_markup: {
						inline_keyboard: [...chunk],
					},
				};
				await bot.sendMessage(
					message.chat.id,
					`Select user for additional info (part ${i + 1}):`,
					inlineKeyboard,
				);
			}
			await bot.sendMessage(message.chat.id, `Total count ${users.accessKeys.length}`);
			logger.success(`[${basename(__filename)}]: Outline users list was handled`);
		} catch (error) {
			logger.error(`Outline users list fetching finished with error: ${error}`);
			await bot.sendMessage(message.chat.id, `Error while fetching Outline users: ${error}`);
		} finally {
			globalHandler.finishCommand();
		}
	}

	async delete(context: KeysContext, message: Message, start: boolean) {
		const chatId = message.chat.id;
		logger.log(`[${basename(__filename)}]: delete${start ? ' Operation start' : ''}`);
		if (this.deleteSteps.delete) {
			await bot.sendMessage(chatId, 'Selected user id to delete: ' + context.id);
			await this.service.delete(context.id, chatId);
			this.deleteSteps.delete = false;
			globalHandler.finishCommand();
			return;
		}

		if (start) {
			await bot.sendMessage(
				chatId,
				'Send start of username for user searching or click on the button to show all users',
				outlineDeleteKeyboard,
			);
			return;
		}
		const users = await this.service.getAll(chatId);
		const keys = context.accept
			? users.accessKeys
			: users.accessKeys.filter(({ name }) => name.startsWith(message.text));

		const buttons = keys.map(({ name, id }) => [
			{
				text: name,
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Keys,
					[CmdCode.Context]: {
						[CmdCode.Command]: VPNKeyCommand.Delete,
						[CmdCode.Protocol]: VPNProtocol.Outline,
						id,
					},
					[CmdCode.Processing]: 1,
				}),
			},
		]);
		const chunkSize = 50;
		const chunksCount = Math.ceil(buttons.length / chunkSize);
		for (let i = 0; i < chunksCount; i++) {
			const chunk = buttons.slice(i * chunkSize, i * chunkSize + chunkSize);
			const inlineKeyboard: SendBasicOptions = {
				reply_markup: {
					inline_keyboard: [...chunk],
				},
			};
			await bot.sendMessage(message.chat.id, `Select user to delete (part ${i + 1}):`, inlineKeyboard);
		}
		this.deleteSteps.delete = true;
	}

	async getUser(id: string, chatId: number) {
		this.log('getUser');
		try {
			const key = await this.service.getUser(id, chatId);
			if (!key) {
				throw new Error('Outline user fetch service returned null');
			}
			const metricsResponse = await this.service.getTransferredMetrics(chatId);
			const transferredRaw = metricsResponse ? metricsResponse?.bytesTransferredByUserId[key.id] : null;
			const transferredMetrics = transferredRaw ? `${transferredRaw / (1024 * 1024 * 1024)} GB` : 'unknown';
			const dataLimit = key.dataLimit?.bytes ? `${key?.dataLimit?.bytes / (1024 * 1024 * 1024)} GB` : 'unset';
			await bot.sendMessage(
				chatId,
				`
id: ${key.id}
name: \`${key.name.replace(/[-.*#_]/g, match => `\\${match}`)}\`
password: \`${key.password.replace(/[-.*#_]/g, match => `\\${match}`)}\`
port: ${key.port}
method: \`${key.method.replace(/[-.*#_]/g, match => `\\${match}`)}\`
accessUrl: \`${key.accessUrl.replace(/[-.*#_]/g, match => `\\${match}`)}\`
transferred data: ${transferredMetrics.replace(/[-.*#_]/g, match => `\\${match}`)}
dataLimit: ${dataLimit.replace(/[-.*#_]/g, match => `\\${match}`)}`,
				{
					parse_mode: 'MarkdownV2',
				},
			);

			await bot.sendMessage(chatId, 'Available operations', getOutlineOperations(id));
			logger.success(`Outline user ${id} has been successfully fetched`);
		} catch (err) {
			logger.error(`Outline user ${id} fetching finished with error: ${err}`);
			await bot.sendMessage(chatId, `Error while fetching outline user ${id}: ${err}`);
		}
	}

	async rename(id: string, message: Message, start: boolean) {
		if (start) {
			await bot.sendMessage(message.chat.id, 'Enter new username');
			return;
		}
		try {
			await this.service.rename(id, message.chat.id, message.text);
			await bot.sendMessage(message.chat.id, 'User has been successfully renamed');
			logger.success(`Outline user ${id} has been successfully renamed to ${message.text}`);
			await this.getUser(id, message.chat.id);
		} catch (err) {
			logger.error(`Outline user ${id} renaming finished with error: ${err}`);
			await bot.sendMessage(message.chat.id, `Error while renaming outline user ${id}: ${err}`);
		} finally {
			globalHandler.finishCommand();
		}
	}

	async setDataLimit(id: string, message: Message, start: boolean) {
		this.log('set data limit');
		if (start) {
			await bot.sendMessage(message.chat.id, 'Enter amount in GB to set data limit');
			return;
		}
		if (isNaN(Number(message.text))) {
			await bot.sendMessage(message.chat.id, 'You entered wrong value. Enter amount in GB to set data limit');
			return;
		}
		try {
			await this.service.setDataLimit(id, message.chat.id, Number(message.text) * 1024 * 1024 * 1024);
			await this.getUser(id, message.chat.id);
		} catch (err) {
			logger.error(`Outline user ${id} data limit setting finished with error: ${err}`);
			await bot.sendMessage(message.chat.id, `Error while data limit setting for outline user ${id}: ${err}`);
		} finally {
			globalHandler.finishCommand();
		}
	}

	async removeDataLimit(id: string, message: Message) {
		this.log('remove data limit');
		try {
			await this.service.removeDataLimit(id, message.chat.id);
			await this.getUser(id, message.chat.id);
		} catch (err) {
			logger.error(`Outline user ${id} data limit removing finished with error: ${err}`);
			await bot.sendMessage(message.chat.id, `Error while data limit removing for outline user ${id}: ${err}`);
		}
	}

	async getMetrics(message) {
		try {
			const metricsResponse = await this.service.getMetrics();
			const current = metricsResponse.server.bandwidth.current;
			const peak = metricsResponse.server.bandwidth.peak;

			await bot.sendMessage(
				message.chat.id,
				`
Общий трафик: ${metricsResponse.server.dataTransferred.bytes / (1024 * 1024)} МБ
Текущий трафик: ${current.data.bytes / (1024 * 1024)} МБ (${new Date(current.timestamp * 1000)})
Максимальный трафик: ${peak.data.bytes / (1024 * 1024)} МБ (${new Date(peak.timestamp * 1000)})
Общее время подключения за последние 30 дней: ${metricsResponse.server.tunnelTime.seconds / (60 * 60)} ч

				`,
			);
			const locations = metricsResponse.server.locations.map(
				location => `
Location: ${location.location}
ASN: ${location.asn}
ORG: ${location.asOrg}
Общий трафик: ${location.dataTransferred.bytes / (1024 * 1024)} МБ
Общее время подключения ${location.tunnelTime.seconds / (60 * 60)} ч
			`,
			);
			for (const locationMsg of locations) {
				await bot.sendMessage(message.chat.id, locationMsg);
			}
		} catch (error) {
			const errMsg = `Outline server metrics fetching error: ${error}`;
			logger.error(errMsg);
			await bot.sendMessage(message.chat.id, errMsg);
		}
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
}
