import type { Message } from 'node-telegram-bot-api';
import env from '../env';

export const isAdmin = (msg: Message): boolean => {
	return msg.from.id === env.ADMIN_USER_ID;
};
