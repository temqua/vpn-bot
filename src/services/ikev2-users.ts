import type { Message } from 'node-telegram-bot-api';
import { createReadStream } from 'node:fs';
import { access, constants } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import util from 'node:util';
import bot from './bot';
import logger from './logger';
import type { IProtocolService } from '../core';

const exec = util.promisify(require('node:child_process').exec);

export class IKEv2UsersService implements IProtocolService {
	async getFile(message: Message, username: string) {
		const filePath = path.resolve(homedir(), process.env.IKE_HOME, `${username}/`, `${username}.zip`);
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
	}
	async getAll(message: Message) {
		const { stdout, stderr } = await exec(`cd ~ && bash ikev2.sh --listclients`);
		if (!!stderr) {
			const errorMsg = `Error while getting IKEv2 clients: ${stderr}`;
			logger.error(errorMsg);
			await bot.sendMessage(message.chat.id, errorMsg);
			return;
		}
		await bot.sendMessage(message.chat.id, stdout);
	}
	async create(message: Message, username: string) {
		const { stdout, stderr } = await exec(`cd ~ && ./create-client.sh ${username.toString()}`);
	}

	async delete(message: Message, username: string) {}
}
