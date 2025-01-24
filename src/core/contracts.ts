import type { Message } from 'node-telegram-bot-api';
import type { CommandContext } from '../interactions';

export interface IKeysService {
	create(message: Message, username: string);
	delete(message: Message, username: string);
	getAll(message: Message);
}

export interface ICommandHandler {
	handle(context: CommandContext, message: Message);
}
