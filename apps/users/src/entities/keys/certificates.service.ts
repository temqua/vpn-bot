import { VPNProtocol } from '@prisma/client';
import type { Message } from 'node-telegram-bot-api';
import { Readable } from 'node:stream';
import { basename } from 'path';
import bot from '../../bot';
import env from '../../env';
import logger from '../../logger';
import { IKEv2KeysService } from './ikev2-users';
import { ICertificatesService } from './keys.types';
import { OpenVPNKeysService } from './openvpn-users';
import { WireguardKeysService } from './wireguard-users';

export class CertificatesService {
	private service: ICertificatesService;
	constructor(
		private protocol: VPNProtocol,
		private url: string,
	) {
		switch (protocol) {
			case VPNProtocol.WireGuard:
				this.service = new WireguardKeysService();
				break;
			case VPNProtocol.OpenVPN:
				this.service = new OpenVPNKeysService();
				break;
			default:
				this.service = new IKEv2KeysService();
				break;
		}
	}

	async create(message: Message, username: string | undefined) {
		this.log(`create ${username}`);
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while creating ${this.protocol} client ${username}`;
		let response;
		try {
			response = await this.request('create', username);
			const result = await response.text();
			await bot.sendMessage(chatId, result);
		} catch (error) {
			await bot.sendMessage(chatId, errorHeader);
			await bot.sendMessage(chatId, `${error}`);
			return;
		}
		if (response.ok) {
			try {
				const extension = this.service.getExtension();
				const fileResponse = await this.request('file', username);
				await bot.sendDocument(
					chatId,
					Readable.fromWeb(fileResponse.body),
					{},
					{
						filename: `${username}.${extension}`,
						contentType: 'application/octet-stream',
					},
				);
				if (this.protocol === VPNProtocol.WireGuard) {
					const qrResponse = await this.request('qr', username);
					await bot.sendDocument(
						chatId,
						Readable.fromWeb(qrResponse.body),
						{},
						{
							filename: username,
							contentType: 'image/png',
						},
					);
				}
				logger.success(`${this.protocol} user ${username} creation was handled`);
			} catch (error) {
				logger.error(errorHeader);
				logger.error(error);
				await bot.sendMessage(chatId, errorHeader);
				await bot.sendMessage(chatId, `${error}`);
			}
		} else {
			const errMessage = `${this.protocol} user ${username} creation failed ${response.status} ${response.statusText}`;
			logger.error(errMessage);
		}
	}
	async delete(message: Message, username: string | undefined) {
		this.log(`delete ${username}`);
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while deleting ${this.protocol} client ${username}`;
		let response;
		try {
			response = await this.request('delete', username);
			const result = await response.text();
			bot.sendMessage(chatId, result);
		} catch (error) {
			bot.sendMessage(chatId, errorHeader);
			bot.sendMessage(chatId, `${error}`);
			return;
		}

		if (response.ok) {
			const okMessage = `${this.protocol} user ${username} deletion has been successfully handled`;
			logger.success(okMessage);
		} else {
			const errMessage = `${this.protocol} user ${username} deletion failed ${response.status} ${response.statusText}`;
			logger.error(errMessage);
		}
	}

	async getAll(message: Message) {
		this.log('getAll');
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while getting ${this.protocol} clients`;

		let response;
		try {
			response = await this.request('list');
			const result = await response.text();
			bot.sendMessage(chatId, result);
		} catch (error) {
			bot.sendMessage(chatId, errorHeader);
			bot.sendMessage(chatId, `${error}`);
			return;
		}

		if (response.ok) {
			const okMessage = `${this.protocol} user list fetching has been successfully handled`;
			logger.success(okMessage);
		} else {
			const errMessage = `${errorHeader} ${response.status} ${response.statusText}`;
			logger.error(errMessage);
		}
	}

	async export(message: Message, username: string) {
		this.log(`export ${username}`);
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while exporting ${this.protocol} client ${username}`;
		let response;
		try {
			response = await this.request('export', username);
			const result = await response.text();
			bot.sendMessage(chatId, result);
		} catch (error) {
			bot.sendMessage(chatId, errorHeader);
			bot.sendMessage(chatId, `${error}`);
			return;
		}
		if (response.ok) {
			const okMessage = `${this.protocol} user ${username} has been successfully exported`;
			logger.success(okMessage);
		} else {
			const errMessage = `${errorHeader} ${response.status} ${response.statusText}`;
			logger.error(errMessage);
		}
	}

	async pause(message: Message, username: string) {
		this.log(`pause ${username}`);
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while temporary disabling ${this.protocol} client ${username}`;
		let response;
		try {
			response = this.request('pause', username);
			const result = await response.text();
			bot.sendMessage(chatId, result);
		} catch (error) {
			bot.sendMessage(chatId, errorHeader);
			bot.sendMessage(chatId, `${error}`);
			return;
		}

		if (response.ok) {
			const okMessage = `${this.protocol} user ${username} has been successfully disabled in wg before next wg-quick@wg0.service restart`;
			logger.success(okMessage);
		} else {
			const errMessage = `${errorHeader} ${response.status} ${response.statusText}`;
			logger.error(errMessage);
		}
	}

	private async request(command: string, username?: string) {
		const qs = username
			? `?${new URLSearchParams({
					username,
				}).toString()}`
			: '';
		return await fetch(`${this.url}:${this.service.port}/${command}${qs}`, {
			headers: {
				'Authorization': env.SERVICE_TOKEN,
			},
		});
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
}
