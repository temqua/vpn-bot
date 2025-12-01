import type { Message } from 'node-telegram-bot-api';
import childProcess from 'node:child_process';
import { createReadStream } from 'node:fs';
import { access, constants } from 'node:fs/promises';
import util from 'node:util';
import { basename } from 'path';
import bot from '../../bot';
import { ICertificatesService } from '../../contracts';
import { VPNProtocol } from '../../enums';
import env from '../../env';
import logger from '../../logger';
import { IKEv2KeysService } from './ikev2-users';
import { OpenVPNKeysService } from './openvpn-users';
import { WireguardKeysService } from './wireguard-users';

const exec = util.promisify(childProcess.exec);

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
			response = await fetch(`http://0.0.0.0:${this.service.port}/create?username=${username}`);
		} catch (error) {
			bot.sendMessage(chatId, errorHeader);
			bot.sendMessage(chatId, `${error}`);
			return;
		}
		const result = await response.text();
		bot.sendMessage(chatId, result);
		if (response.ok) {
			try {
				await this.getFile(message, username);
				if (this.protocol === VPNProtocol.WG) {
					await this.getQRCode(message, username);
				}
				logger.success(`${this.protocol} user ${username} creation was handled`);
				bot.sendMessage(chatId, `${this.protocol} user ${username} creation was handled`);
			} catch (error) {
				logger.error(errorHeader);
				logger.error(error);
				bot.sendMessage(chatId, errorHeader);
				bot.sendMessage(chatId, `${error}`);
			}
		}
	}
	async delete(message: Message, username: string | undefined) {
		this.log(`delete ${username}`);
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while deleting ${this.protocol} client ${username}`;
		let response;
		try {
			response = await fetch(`http://0.0.0.0:${this.service.port}/delete?username=${username}`);
		} catch (error) {
			bot.sendMessage(chatId, errorHeader);
			bot.sendMessage(chatId, `${error}`);
			return;
		}
		const result = await response.text();
		bot.sendMessage(chatId, result);
		if (response.ok) {
			logger.success(`${this.protocol} user ${username} deletion has been successfully handled`);
			bot.sendMessage(chatId, `${this.protocol} user ${username} deletion has been successfully handled`);
		}
	}

	async getAll(message: Message) {
		this.log('getAll');
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while getting ${this.protocol} clients`;

		let response;
		try {
			response = await fetch(`http://0.0.0.0:${this.service.port}/list`);
		} catch (error) {
			bot.sendMessage(chatId, errorHeader);
			bot.sendMessage(chatId, `${error}`);
			return;
		}
		const result = await response.text();
		bot.sendMessage(chatId, result);
		if (response.ok) {
			logger.success(`${this.protocol} user list has been successfully handled`);
		}
	}

	async export(message: Message, username: string) {
		this.log(`export ${username}`);
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while exporting ${this.protocol} client ${username}`;
		let response;
		try {
			response = await fetch(`http://0.0.0.0:${this.service.port}/export?username=${username}`);
		} catch (error) {
			bot.sendMessage(chatId, errorHeader);
			bot.sendMessage(chatId, `${error}`);
			return;
		}
		const result = await response.text();
		bot.sendMessage(chatId, result);
		if (response.ok) {
			logger.success(`${this.protocol} user ${username} has been successfully exported`);
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

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
}
