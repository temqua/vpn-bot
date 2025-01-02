import type { Message } from 'node-telegram-bot-api';
import { spawn } from 'node:child_process';
import bot from './bot';
import logger from '../core/logger';
import util from 'node:util';

const exec = util.promisify(require('node:child_process').exec);

export class LogsService {
	async vnstat(msg: Message, flags: string[] = []) {
		try {
			const vnstatLogs = spawn('vnstat', flags);
			vnstatLogs.stdout.on('data', async data => {
				await bot.sendMessage(msg.chat.id, data.toString());
			});

			vnstatLogs.stderr.on('data', async data => {
				const errorMsg = `Error while getting vnstat logs: ${data}`;
				logger.error(errorMsg);
				await bot.sendMessage(msg.chat.id, errorMsg);
			});

			vnstatLogs.on('close', async code => {
				const message = `vnstat logs process exited with code ${code}`;
				logger.log(message);
				await bot.sendMessage(msg.chat.id, message);
			});
		} catch (error) {
			const errorMsg = `Error while getting vnstat logs: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(msg.chat.id, errorMsg);
		}
	}

	async wg(msg: Message) {
		try {
			const { stdout, stderr } = await exec('wg');
			if (!!stdout) {
				await bot.sendMessage(msg.chat.id, stdout.toString());
			}
			if (!!stderr) {
				const errorMsg = `Error while executing wg command: ${stderr}`;
				logger.error(errorMsg);
				await bot.sendMessage(msg.chat.id, errorMsg);
				return;
			}
		} catch (error) {
			const errorMsg = `Error while getting wg output: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(msg.chat.id, errorMsg);
		}
	}
}

export const logsService = new LogsService();
