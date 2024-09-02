import type { Message } from 'node-telegram-bot-api';
import { spawn } from 'node:child_process';
import bot from './bot';
import logger from './logger';

export class LogsService {
	async get(msg: Message) {
		try {
			const pm2Logs = spawn('pm2', ['--no-color', 'logs']);

			pm2Logs.stdout.on('data', async data => {
				await bot.sendMessage(msg.chat.id, data.toString());
			});

			pm2Logs.stderr.on('data', async data => {
				const errorMsg = `Error while getting pm2 logs: ${data}`;
				logger.error(errorMsg);
				await bot.sendMessage(msg.chat.id, errorMsg);
			});

			pm2Logs.on('close', async code => {
				const message = `pm2 logs process exited with code ${code}`;
				logger.log(message);
				await bot.sendMessage(msg.chat.id, message);
			});
		} catch (error) {
			const errorMsg = `Error while getting pm2 logs: ${error}`;
			logger.error(errorMsg);
			await bot.sendMessage(msg.chat.id, errorMsg);
		}
	}

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
}

export const logsService = new LogsService();
