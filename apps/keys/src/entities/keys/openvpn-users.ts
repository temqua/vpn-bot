import type { Message } from 'node-telegram-bot-api';
import childProcess from 'node:child_process';
import { createReadStream } from 'node:fs';
import { access, constants } from 'node:fs/promises';
import { homedir } from 'node:os';
import path, { basename } from 'node:path';
import util from 'node:util';
import bot from '../../bot';
import type { ICertificatesService } from '../../contracts';
import env from '../../env';
import logger from '../../logger';

const exec = util.promisify(childProcess.exec);
export class OpenVPNKeysService implements ICertificatesService {
	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
	async export(message: Message, username: string) {
		this.log(`export ${username}`);
		try {
			const { stdout, stderr } = await exec(`openvpn.sh --exportclient ${username}`);
			if (stderr) {
				const errorMsg = `Error while exporting OpenVPN client: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			await bot.sendMessage(message.chat.id, stdout);
			logger.success(`OpenVPN user ${username} has been successfully exported`);
		} catch (error) {
			const errorMsg = `Error while exporting OpenVPN client: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}

	async getFile(message: Message, username: string) {
		this.log(`getFile ${username}`);
		const filePath = path.resolve(homedir(), env.OVPN_CONTAINER_DIR, `${username}.ovpn`);
		try {
			await access(filePath, constants.F_OK);
			await bot.sendDocument(
				message.chat.id,
				createReadStream(filePath),
				{},
				{
					filename: `${username}.ovpn`,
					contentType: 'application/octet-stream',
				},
			);
		} catch (error) {
			const errorMsg = `Error while getting OpenVPN file for ${username} (${filePath}) ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}

	async getAll(message: Message) {
		this.log('getAll');
		try {
			const { stdout, stderr } = await exec('openvpn.sh --listclients');
			if (stderr) {
				const errorMsg = `stderr while getting OpenVPN clients: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			await bot.sendMessage(message.chat.id, stdout);
			logger.success('OpenVPN clients list was handled');
		} catch (error) {
			const errorMsg = `Error while getting OpenVPN clients: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}

	async create(message: Message, username: string) {
		this.log(`create ${username}`);
		try {
			const command = `bash ${env.CREATE_PATH} ${username.toString()} openvpn`;
			logger.log(command);
			const { stdout, stderr } = await exec(command);
			if (stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			if (stderr) {
				const errorMsg = `stderr content while creating OpenVPN client ${username}: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
			}
			logger.success(`OpenVPN user ${username} creation was handled`);
			await this.getFile(message, username);
		} catch (error) {
			const errorMsg = `Error while creating OpenVPN client ${username}: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
		}
	}
	async delete(message: Message, username: string) {
		this.log(`delete ${username}`);
		try {
			const { stdout, stderr } = await exec(`bash ${env.DELETE_PATH} ${username.toString()} openvpn`);
			if (stdout) {
				await bot.sendMessage(message.chat.id, stdout.toString());
			}
			if (stderr) {
				const errorMsg = `stderr content while deleting OpenVPN client ${username}: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(message.chat.id, errorMsg);
				return;
			}
			logger.success(`OpenVPN user ${username} deletion was handled`);
		} catch (error) {
			const errorMsg = `Error while deleting OpenVPN client ${username}: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
			return;
		}
	}
}
