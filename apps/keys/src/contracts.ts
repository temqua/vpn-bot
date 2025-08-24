import type { Message } from 'node-telegram-bot-api';
import type { CommandContext } from './global.handler';

export interface IKeysService {
	create(message: Message, username: string): void;
	delete(message: Message, username: string): void;
	getAll(message: Message): void;
}

export interface ICertificatesService extends IKeysService {
	getFile(message: Message, username: string): void;
	export(message: Message, username: string): void;
}

export interface ICommandHandler {
	handle(context: CommandContext, message: Message, start?: boolean): void;
}
