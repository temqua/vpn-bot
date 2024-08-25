import type { Message } from 'node-telegram-bot-api';

export interface IProtocolService {
	create(message: Message, username: string);
	delete(message: Message, username: string);
	getFile(message: Message, username: string);
    getAll(message: Message);
}
