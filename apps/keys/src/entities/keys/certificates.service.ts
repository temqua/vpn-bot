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
		try {
			const command = `bash ${env.CREATE_PATH} ${username.toString()} ${this.protocol}`;
			logger.log(command);
			const { stdout, stderr } = await exec(command);
			if (stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			if (stderr) {
				logger.error(errorHeader);
				logger.error(stderr.toString());
				await bot.sendMessage(chatId, errorHeader);
				await bot.sendMessage(chatId, stderr.toString());
			}
			logger.success(`${this.protocol} user ${username} creation was handled`);
			await this.getFile(message, username);
		} catch (error) {
			logger.error(errorHeader);
			logger.error(error);
			await bot.sendMessage(chatId, errorHeader);
			await bot.sendMessage(chatId, `${error}`);
		}
	}
	async delete(message: Message, username: string | undefined) {
		this.log(`delete ${username}`);
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while deleting ${this.protocol} client ${username}`;
		try {
			const { stdout, stderr } = await exec(`bash ${env.DELETE_PATH} ${username.toString()} ${this.protocol}`);
			if (stdout) {
				await bot.sendMessage(chatId, stdout.toString());
			}
			if (stderr) {
				logger.error(errorHeader);
				logger.error(stderr.toString());
				await bot.sendMessage(chatId, errorHeader);
				await bot.sendMessage(chatId, stderr.toString());
				return;
			}
			logger.success(`${this.protocol} user ${username} deletion was handled`);
		} catch (error) {
			logger.error(errorHeader);
			logger.error(error);
			await bot.sendMessage(chatId, errorHeader);
			await bot.sendMessage(chatId, `${error}`);
		}
	}

	async getAll(message: Message) {
		this.log('getAll');
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while getting ${this.protocol} clients`;
		try {
			const { stdout, stderr } = await exec(`${this.protocol}.sh --listclients`);
			if (stderr) {
				logger.error(errorHeader);
				logger.error(stderr.toString());
				await bot.sendMessage(chatId, errorHeader);
				await bot.sendMessage(chatId, stderr.toString());
				return;
			}
			await bot.sendMessage(chatId, stdout);
			logger.success(`${this.protocol} user list was handled`);
		} catch (error) {
			logger.error(errorHeader);
			logger.error(error);
			await bot.sendMessage(chatId, errorHeader);
			await bot.sendMessage(chatId, `${error}`);
		}
	}

	async export(message: Message, username: string) {
		this.log(`export ${username}`);
		const chatId = message.chat.id;
		const errorHeader = `Error occurred while exporting ${this.protocol} client ${username}`;
		try {
			const { stdout, stderr } = await exec(`${this.protocol}.sh --exportclient ${username}`);
			if (stderr) {
				logger.error(errorHeader);
				logger.error(stderr.toString());
				await bot.sendMessage(chatId, errorHeader);
				await bot.sendMessage(chatId, stderr.toString());
				return;
			}
			await bot.sendMessage(chatId, stdout);
			logger.success(`${this.protocol} user ${username} has been successfully exported`);
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
