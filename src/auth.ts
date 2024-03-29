import type { VpnUser } from '@prisma/client';
import { sendMessage } from './utils';
import prisma from './services/prisma';
import { ADMIN_USER_ID } from './env';

export const isAdmin = async (msg): Promise<boolean> => {
	if (msg.from.id !== ADMIN_USER_ID) {
		await sendMessage(msg.chat.id, msg.from.language_code, 'forbidden');
		await sendMessage(msg.chat.id, msg.from.language_code, 'else');
	}
	return msg.from.id === ADMIN_USER_ID;
};

export const isAdded = async (msg): Promise<boolean> => {
	const user: VpnUser = await prisma.vpnUser.findFirst({
		where: {
			telegramId: msg.from.id,
		},
	});

	return !!user;
};
