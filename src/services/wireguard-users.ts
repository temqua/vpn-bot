import type { Message } from 'node-telegram-bot-api';
import { createReadStream } from 'node:fs';
import { access, constants } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import util from 'node:util';
import type { IProtocolService } from '../core';
import { CREATE_PATH, DELETE_PATH, WG_CONTAINER_DIR } from '../env';
import bot from './bot';
import logger from './logger';

const exec = util.promisify(require('node:child_process').exec);

export class WireguardUsersService implements IProtocolService {
	async getFile(message: Message, username: string) {
		const filePath = path.resolve(homedir(), WG_CONTAINER_DIR, `${username}.conf`);
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
		try {
			const { stdout, stderr } = await exec(`bash wireguard.sh --listclients`);
			if (!!stderr) {
				const errorMsg = `Error while getting WireGuard clients: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			await bot.sendMessage(message.chat.id, stdout);
			logger.success('WireGuard user list was handled');
		} catch (error) {
			const errorMsg = `Error while getting WireGuard clients: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}

	async create(message: Message, username: string) {
		try {
			const command = `bash ${CREATE_PATH} ${username.toString()} wg`;
			logger.log(command);
			const { stdout, stderr } = await exec(command);
			if (!!stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			if (!!stderr) {
				const errorMsg = `Error while creating wireguard client ${username}: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			logger.success(`WireGuard user ${username} creation was handled`);
			await this.getFile(message, username);
		} catch (error) {
			const errorMsg = `Error while creating wireguard client ${username}: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}
	async delete(message: Message, username: string) {
		try {
			const { stdout, stderr } = await exec(`bash ${DELETE_PATH} ${username.toString()} wg`);
			if (!!stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			if (!!stderr) {
				const errorMsg = `Error while deleting wireguard client ${username}: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			logger.success(`WireGuard user ${username} deletion was handled`);
		} catch (error) {
			const errorMsg = `Error while deleting wireguard client ${username}: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
			return;
		}
	}
}
