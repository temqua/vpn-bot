import type { Message } from 'node-telegram-bot-api';
import { createReadStream } from 'node:fs';
import { access, constants } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import util from 'node:util';
import type { IProtocolService } from '../core';
import { CREATE_WG_PATH, DELETE_WG_PATH, WG_HOME } from '../env';
import bot from './bot';
import logger from './logger';

const exec = util.promisify(require('node:child_process').exec);

export class WireguardUsersService implements IProtocolService {
	async getFile(message: Message, username: string) {
		const filePath = path.resolve(homedir(), WG_HOME, `${username}.conf`);
		try {
			await access(filePath, constants.F_OK);
			await bot.sendDocument(
				message.chat.id,
				createReadStream(filePath),
				{},
				{
					filename: `${username}.conf`,
					contentType: 'application/octet-stream',
				},
			);
		} catch (error) {
			const errorMsg = `Error while getting WireGuard file for ${username} (${filePath}) ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}

	async getAll(message: Message) {
		const { stdout, stderr } = await exec(`cd ~ && wireguard.sh --listclients`);
		if (!!stderr) {
			const errorMsg = `Error while getting WireGuard clients: ${stderr}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
			return;
		}
		await bot.sendMessage(message.chat.id, stdout);
		logger.success('WireGuard user list was handled');
	}

	async create(message: Message, username: string) {
		const { stdout, stderr } = await exec(`cd ~ && bash ${CREATE_WG_PATH} ${username.toString()}`);
		try {
			if (!!stderr) {
				const errorMsg = `Error while creating wireguard client ${username}: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			if (!!stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			await bot.sendMessage(message.chat.id, `WireGuard user ${username} was successfully created`);
			logger.success(`WireGuard user ${username} creation was handled`);
			await this.getFile(message, username);
		} catch (error) {
			const errorMsg = `Error while creating wireguard client ${username}: ${stderr}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}
	async delete(message: Message, username: string) {
		try {
			const { stdout, stderr } = await exec(`cd ~ bash ${DELETE_WG_PATH} ${username.toString()}`);

			if (!!stderr) {
				const errorMsg = `Error while deleting wireguard client ${username}: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			if (!!stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			await bot.sendMessage(message.chat.id, `WireGuard user ${username} was successfully deleted`);
			logger.success(`IKEv2 user delete ${username} was handled`);
		} catch (error) {
			const errorMsg = `Error while deleting wireguard client ${username}: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
			return;
		}
	}
}