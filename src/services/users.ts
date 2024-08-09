import type { Message } from 'node-telegram-bot-api';
import querystring from 'node:querystring';
import { PORT, TOKEN, VPN_SERVER_IP } from '../env';
import bot from './bot';
import logger from './logger';

type ErrorResponse = {
	error: string;
};

export async function getUser(msg: Message, username: string) {

}

export async function getUserByTelegramUsername(msg: Message, username: string) {
}

export async function showIkeClients(msg: Message): Promise<void> {
	const result = await fetch(`http://${VPN_SERVER_IP}:${PORT}/users`, {
		headers: {
			'Authorization': `Bearer ${TOKEN}`,
		},
	});
	if (result.ok) {
		await bot.sendMessage(msg.chat.id, `${result.status} ${result.statusText} \n${await result.text()}`);
	} else {
		const error = <ErrorResponse>await result.json();
		await bot.sendMessage(
			msg.chat.id,
			`❌Error occurred while getting users list from server \n${result.status} ${result.statusText} \n${error.error}`,
		);
		logger.error(
			`Error occurred while getting users list from server \n${result.status} ${result.statusText} \n${error.error}`,
		);
	}
}

export async function createUser(msg: Message, username: string): Promise<void> {
	try {
		const qs = querystring.encode({
			username: username,
		});
		const result = await fetch(`http://${VPN_SERVER_IP}:${PORT}/user/create?${qs}`, {
			headers: {
				'Authorization': `Bearer ${TOKEN}`,
			},
		});
		if (result.ok) {
			await bot.sendMessage(msg.chat.id, `${result.status} ${result.statusText} \n${await result.text()}`);
			await bot.sendMessage(msg.chat.id, '✅User has been successfully created');
			logger.success(`User with username ${username} has been successfully created`);
		} else {
			logger.error(
				`Error occurred while creating user\n${result.status} ${result.statusText} \n${await result.text()}`,
			);
			await bot.sendMessage(
				msg.chat.id,
				`❌Error occurred while creating user\n${result.status} ${result.statusText} \n${await result.text()}`,
			);
		}
	} catch (error) {
		logger.error(`Error occurred while creating user\n${error.stack}`);
		await bot.sendMessage(msg.chat.id, `❌Error occurred while creating user\n${error.stack}`);
	}
}

export async function getUserFile(msg: Message, username: string): Promise<void> {
	const qs = querystring.encode({
		username,
	});
	try {
		const result = await fetch(`http://${VPN_SERVER_IP}:${PORT}/user/file?${qs}`, {
			headers: {
				'Authorization': `Bearer ${TOKEN}`,
			},
		});
		if (result.ok) {
			const file = await result.arrayBuffer();
			await bot.sendDocument(
				msg.chat.id,
				Buffer.from(file),
				{},
				{
					filename: `${username}.zip`,
					contentType: 'application/octet-stream',
				},
			);
		} else {
			const error = <ErrorResponse>await result.json();
			logger.error(`Error occurred while receiving file for ${username} \n${error.error}`);
			await bot.sendMessage(
				msg.chat.id,
				`❌Error occurred while receiving file for ${username} \n${error.error}`,
			);
		}
	} catch (error) {
		logger.error(`Error occurred while receiving file for ${username} \n${error.stack}`);
		await bot.sendMessage(msg.chat.id, `❌Error occurred while receiving file for ${username} \n${error.stack}`);
	}
}