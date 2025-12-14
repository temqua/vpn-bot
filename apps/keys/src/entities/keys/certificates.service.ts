import type { Message } from 'node-telegram-bot-api';
import { createReadStream } from 'node:fs';
import { access, constants } from 'node:fs/promises';
import { basename } from 'path';
import bot from '../../bot';
import { ICertificatesService } from '../../contracts';
import { VPNProtocol } from '../../enums';
import logger from '../../logger';
import { IKEv2KeysService } from './ikev2-users';
import { OpenVPNKeysService } from './openvpn-users';
import { WireguardKeysService } from './wireguard-users';
import env from '../../env';

export class CertificatesService {
	private service: ICertificatesService;
	constructor(private protocol: VPNProtocol) {
		switch (protocol) {
			case VPNProtocol.WG:
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

	async getFile(message: Message, username: string | undefined) {
		this.log(`getFile ${username}`);
		const { path, extension } = this.service.getFileInfo(username);
		const chatId = message.chat.id;
		const errorHeader = `Error while getting ${this.protocol} file for ${username} (${path})`;
		try {
			await access(path, constants.F_OK);
			await bot.sendDocument(
				chatId,
				createReadStream(path),
				{},
				{
					filename: `${username}.${extension}`,
					contentType: 'application/octet-stream',
				},
			);
		} catch (error) {
			logger.error(errorHeader);
			logger.error(error);
			await bot.sendMessage(chatId, errorHeader);
			await bot.sendMessage(chatId, `${error}`);
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
				await this.getFile(message, username);
				if (this.protocol === VPNProtocol.WG) {
					await this.getQRCode(message, username);
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

	async getQRCode(message: Message, username: string) {
		this.log(`getQRCode ${username}`);
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while exporting ${this.protocol} QR Code for ${username}`;
		const path = this.service.getQRCodePath(username);
		try {
			await access(path, constants.F_OK);
			await bot.sendDocument(
				chatId,
				createReadStream(path),
				{},
				{
					filename: path,
					contentType: 'image/png',
				},
			);
		} catch (error) {
			logger.error(errorHeader);
			logger.error(error);
			await bot.sendMessage(chatId, errorHeader);
			await bot.sendMessage(chatId, `${error}`);
		}
	}

	private async request(command: string, username?: string) {
		const qs = username
			? `?${new URLSearchParams({
					username,
				}).toString()}`
			: '';
		return await fetch(`${env.HOST_URL}:${this.service.port}/${command}${qs}`, {
			headers: {
				'X-Auth-Token': env.SERVICE_TOKEN,
			},
		});
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
}
