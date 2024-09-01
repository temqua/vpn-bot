import type { Message } from 'node-telegram-bot-api';
import { createReadStream } from 'node:fs';
import { access, constants } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import util from 'node:util';
import bot from './bot';
import logger from './logger';
import type { IProtocolService } from '../core';
import { CREATE_IKE2_PATH, DELETE_IKE2_PATH, IKE_HOME } from '../env';

const exec = util.promisify(require('node:child_process').exec);

export class IKEv2UsersService implements IProtocolService {
	async getFile(message: Message, username: string) {
		const filePath = path.resolve(homedir(), IKE_HOME, `${username}/`, `${username}.zip`);
		try {
			await access(filePath, constants.F_OK);
			await bot.sendDocument(
				message.chat.id,
				createReadStream(filePath),
				{},
				{
					filename: `${username}.zip`,
					contentType: 'application/octet-stream',
				},
			);
		} catch (error) {
			const errorMsg = `Error while getting IKEv2 file for ${username} (${filePath}) ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}
	async getAll(message: Message) {
		try {
			const { stdout, stderr } = await exec(`cd ~ && ikev2.sh --listclients`);
			if (!!stderr) {
				const errorMsg = `Error while getting IKEv2 clients: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			if (!!stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			logger.success('IKEv2 user list was handled');
		} catch (error) {
			const errorMsg = `Error while getting IKEv2 clients: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}
	async create(message: Message, username: string) {
		try {
			const { stdout, stderr } = await exec(`cd ~ && bash ${CREATE_IKE2_PATH} ${username.toString()}`);
			if (!!stderr) {
				const errorMsg = `Error while creating IKEv2 client ${username}: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			if (!!stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			if (!stdout) {
				await bot.sendMessage(message.chat.id, `IKEv2 user ${username} creation was successfully applied`);
			}
			logger.success(`IKEv2 user ${username} creation was handled`);
			await this.getFile(message, username);
		} catch (error) {
			const errorMsg = `Error while creating IKEv2 client ${username}: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}

	async delete(message: Message, username: string) {
		try {
			const { stdout, stderr } = await exec(`cd ~ && bash ${DELETE_IKE2_PATH} ${username.toString()}`);

			if (!!stderr) {
				const errorMsg = `Error while deleting IKEv2 client ${username}: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			if (!!stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			if (!stdout) {
				await bot.sendMessage(message.chat.id, `IKEv2 user delete ${username} was successfully applied`);
			}
			logger.success(`IKEv2 user ${username} deletion was handled`);
		} catch (error) {
			const errorMsg = `Error while deleting IKEv2 client ${username}: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}
}
