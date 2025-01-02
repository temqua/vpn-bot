import type { Message } from 'node-telegram-bot-api';
import { ADMIN_USER_ID } from '../env';

export interface IProtocolService {
	create(message: Message, username: string);
	delete(message: Message, username: string);
	getAll(message: Message);
}

export const isAdmin = (msg: Message): boolean => {
	return msg.from.id === ADMIN_USER_ID;
};
