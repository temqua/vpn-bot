import type { Message } from 'node-telegram-bot-api';
import env from '../env';

export interface IKeysService {
	create(message: Message, username: string);
	delete(message: Message, username: string);
	getAll(message: Message);
}

export const isAdmin = (msg: Message): boolean => {
	return msg.from.id === env.ADMIN_USER_ID;
};
