import type { Message } from 'node-telegram-bot-api';
import type { CommandContext } from './global.handler';

export interface ICommandHandler {
	handle(context: CommandContext | null | undefined, message: Message | null | undefined, start?: boolean): void;
}
