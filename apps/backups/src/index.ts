import ms from 'ms';
import TelegramBot, { type Message } from 'node-telegram-bot-api';
import childProcess from 'node:child_process';
import { createReadStream } from 'node:fs';
import { access, constants } from 'node:fs/promises';
import path from 'node:path';
import util from 'node:util';
import env from './env';
import logger from './logger';
import { isAdmin } from './utils';

const bot = new TelegramBot(env.BACKUPS_BOT_TOKEN, { polling: true });
const exec = util.promisify(childProcess.exec);

setInterval(() => {
	sendDump();
}, ms('5d'));

async function sendDump() {
	const date = new Date();
	const fileName = `vpn_db_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}.backup`;
	dump(fileName).then(() => {
		send(fileName);
	});
}

async function dump(fileName: string) {
	try {
		const { stdout, stderr } = await exec(
			`PGPASSWORD="${env.DB_PWD}" pg_dump --file "${fileName}" -U "${env.DB_USER}" --host "${env.DB_HOST}" --port "${env.DB_PORT}" -d "${env.DB_NAME}" --format=c --blobs --encoding "UTF8" --verbose --schema "public"`,
		);
		if (stderr) {
			const errorMsg = `stderr: ${stderr}`;
			logger.error(errorMsg);
			await bot.sendMessage(env.ADMIN_USER_ID, errorMsg);
			return;
		}
		await bot.sendMessage(env.ADMIN_USER_ID, stdout);
		logger.success('dump has been successfully created');
	} catch (error) {
		const errorMsg = `Error while creating vpn database dump: ${error}`;
		logger.error(errorMsg);
		await bot.sendMessage(env.ADMIN_USER_ID, errorMsg);
	}
}

async function send(fileName: string) {
	const filePath = path.resolve('/backups', fileName);
	try {
		await access(filePath, constants.F_OK);
		await bot.sendDocument(
			env.ADMIN_USER_ID,
			createReadStream(filePath),
			{},
			{
				filename: fileName,
				contentType: 'application/octet-stream',
			},
		);
	} catch (error) {
		const errorMsg = `Error while sending backup file for (${filePath}) ${error}`;
		logger.error(errorMsg);
		await bot.sendMessage(env.ADMIN_USER_ID, errorMsg);
	}
}

bot.onText(/\/start/, async (msg: Message) => {
	logger.success('Ready');
	await bot.sendMessage(msg.chat.id, '✅ Ready');
});

bot.onText(/\/ping$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.success('PONG');
	await bot.sendMessage(msg.chat.id, '✅ PONG');
});

bot.onText(/\/create/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	sendDump();
});
