import type { Message, User } from 'node-telegram-bot-api';
import type { CommandContext } from './global.handler';
import TelegramBot from 'node-telegram-bot-api';

export interface ICommandHandler {
	handle(
		context: CommandContext | null | undefined,
		message: Message | null | undefined,
		from: User,
		start?: boolean,
	): void;
	handleQuery(context: CommandContext | null | undefined, query: TelegramBot.CallbackQuery, start?: boolean): void;
}
