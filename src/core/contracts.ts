import type { Message } from 'node-telegram-bot-api';
import type { CommandContext } from './globalHandler';

export interface IKeysService {
	create(message: Message, username: string);
	delete(message: Message, username: string);
	getAll(message: Message);
}

export interface ICertificatesService extends IKeysService {
	getFile(message: Message, username: string);
}

export interface ICommandHandler {
	handle(context: CommandContext, message: Message, start?: boolean);
}
