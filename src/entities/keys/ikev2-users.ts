import type { Message } from 'node-telegram-bot-api';
import childProcess from 'node:child_process';
import { createReadStream } from 'node:fs';
import { access, constants } from 'node:fs/promises';
import path, { basename } from 'node:path';
import util from 'node:util';
import bot from '../../core/bot';
import type { ICertificatesService } from '../../core/contracts';
import logger from '../../core/logger';
import env from '../../env';

const exec = util.promisify(childProcess.exec);
export class IKEv2KeysService implements ICertificatesService {
	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}

	async export(message: Message, username: string) {
		this.log(`export ${username}`);
		try {
			const { stdout, stderr } = await exec(`ikev2.sh --exportclient ${username}`);
			if (stderr) {
				const errorMsg = `Error while exporting IKEv2 client: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			await bot.sendMessage(message.chat.id, stdout);
			logger.success(`IKEv2 user ${username} has been successfully exported`);
		} catch (error) {
			const errorMsg = `Error while exporting IKEv2 client: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}

	async getFile(message: Message, username: string) {
		this.log(`getFile ${username}`);
		const filePath = path.resolve(env.IKE_CONTAINER_DIR, `${username}/`, `${username}.zip`);
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
		this.log('getAll');
		try {
			const { stdout, stderr } = await exec(`ikev2.sh --listclients`);
			if (stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			if (stderr) {
				const errorMsg = `Error while getting IKEv2 clients: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			logger.success('IKEv2 user list was handled');
		} catch (error) {
			const errorMsg = `Error while getting IKEv2 clients: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}

	async create(message: Message, username: string) {
		this.log(`create ${username}`);
		try {
			const command = `bash ${env.CREATE_PATH} ${username.toString()} ikev2`;
			logger.log(command);
			const { stdout, stderr } = await exec(command);
			if (stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			if (stderr) {
				const errorMsg = `Error while creating IKEv2 client ${username}: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
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
		this.log(`delete ${username}`);
		try {
			const { stdout, stderr } = await exec(`bash ${env.DELETE_PATH} ${username.toString()} ikev2`);
			if (stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			if (stderr) {
				const errorMsg = `Error while deleting IKEv2 client ${username}: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			logger.success(`IKEv2 user ${username} deletion was handled`);
		} catch (error) {
			const errorMsg = `Error while deleting IKEv2 client ${username}: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}
}
