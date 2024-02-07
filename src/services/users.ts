import type { VpnUser } from '@prisma/client';
import type { Message } from 'node-telegram-bot-api';
import prisma from './prisma';
import bot from './bot';
import { PORT, TOKEN, VPN_SERVER_IP } from '../env';
import querystring from 'node:querystring';
import { getDesktopOS, getDeviceOS, sendMessage } from '../utils';
import logger from './logger';

type ErrorResponse = {
	error: string;
};

export async function getUser(msg: Message, username: string): Promise<VpnUser | undefined> {
	logger.log(`attempt to get user by username ${username} chat id ${msg.chat.id}`);
	return prisma.vpnUser.findFirst({
		where: {
			username: username,
		},
	});
}

export async function getUserByTelegramUsername(msg: Message, username: string): Promise<VpnUser | undefined> {
	logger.log(`attempt to get user by telegram username ${username} chat id ${msg.chat.id}`);
	return prisma.vpnUser.findFirst({
		where: {
			telegramUsername: username,
		},
	});
}

export async function updateExistingUser(msg: Message, user: VpnUser): Promise<VpnUser> {
	logger.log(`attempt to update user telegram id by telegram username chat id ${msg.chat.id}`);
	return prisma.vpnUser.update({
		where: { username: user.username },
		data: {
			telegramId: msg.from.id,
			telegramUsername: msg.from.username,
			languageCode: msg.from.language_code,
		},
	});
}

export async function getUserByTelegramId(msg: Message, id: number): Promise<VpnUser | undefined> {
	logger.log(`attempt to get user by telegram id ${id} chat id ${msg.chat.id}`);
	return prisma.vpnUser.findFirst({
		where: {
			telegramId: id,
		},
	});
}

export async function getUserById(msg: Message, userId: number): Promise<VpnUser | undefined> {
	logger.log(`attempt to get user by id ${userId} chat id ${msg.chat.id}`);
	return prisma.vpnUser.findFirst({
		where: {
			id: userId,
		},
	});
}

export async function getAllUsers(msg: Message): Promise<VpnUser[]> {
	logger.log(`attempt to get all users chat id ${msg.chat.id}`);
	return prisma.vpnUser.findMany();
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

export async function createUser(msg: Message, user: NewUser): Promise<void> {
	try {
		const qs = querystring.encode({
			username: user.username,
		});
		const result = await fetch(`http://${VPN_SERVER_IP}:${PORT}/user/create?${qs}`, {
			headers: {
				'Authorization': `Bearer ${TOKEN}`,
			},
		});
		if (result.ok) {
			await prisma.vpnUser.create({
				data: user,
			});
			await bot.sendMessage(msg.chat.id, `${result.status} ${result.statusText} \n${await result.text()}`);
			await bot.sendMessage(msg.chat.id, '✅User has been successfully created');
			logger.success(`User with username ${user.username} has been successfully created`);
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

export async function updateUser(msg: Message, username: string, updated: querystring.ParsedUrlQuery): Promise<void> {
	const currentUser = await prisma.vpnUser.findFirst({
		where: {
			username: username,
		},
	});
	const user: VpnUser = {
		...currentUser,
		desktopOS: updated?.desktop_os ? getDesktopOS(updated?.desktop_os as string) : currentUser.desktopOS,
		deviceOS: updated?.device_os ? getDeviceOS(updated?.device_os as string) : currentUser.deviceOS,
		firstName: updated?.first_name?.toString() ?? currentUser.firstName,
		lastName: updated?.last_name?.toString() ?? currentUser.lastName,
		phone: updated?.phone?.toString() ?? currentUser.phone,
		telegramUsername: updated?.telegram_username?.toString() ?? currentUser.telegramUsername,
		paymentCount: Number(updated?.payment_count ?? currentUser.paymentCount),
		paymentDay: Number(updated?.payment_day ?? currentUser.paymentDay),
		paidMonthsCount: Number(updated.paid_months_count ?? currentUser.paidMonthsCount),
		autoPay: updated?.auto_pay === 'true' ? true : false,
	};
	try {
		await prisma.vpnUser.update({
			where: {
				username: username,
			},
			data: user,
		});
		logger.success(`User with username ${username} has been successfully updated`);
		await bot.sendMessage(msg.chat.id, '✅User has been successfully updated');
	} catch (error) {
		logger.error(`Error occurred while updating user ${username} \n${error.stack}`);
		await bot.sendMessage(msg.chat.id, `❌Error occurred while updating user ${username} \n${error.stack}`);
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

export const formatUserMin = (user: VpnUser): string => {
	return `\`\`\`
	username: ${user.username}
	telegram_username: ${user.telegramUsername}
	first_name: ${user.firstName}
	payment_count: ${user.paymentCount}
	payment_day: ${user.paymentDay}
	paid_months: ${user.paidMonthsCount}
		\`\`\``;
};

export const formatUser = (user: VpnUser): string => {
	return `\`\`\`
id: ${user.id}
username: ${user.username}
telegram_id: ${user.telegramId}
telegram_username: ${user.telegramUsername}
first_name: ${user.firstName}
last_name: ${user.lastName}
phone: ${user.phone}
language_code: ${user.languageCode}
payment_count: ${user.paymentCount}
payment_day: ${user.paymentDay}
desktop_os: ${user.desktopOS}
device_os: ${user.deviceOS}
paid_months: ${user.paidMonthsCount}
auto_pay: ${user.autoPay}
	\`\`\``;
};

export type NewUser = Omit<VpnUser, 'id'>;
