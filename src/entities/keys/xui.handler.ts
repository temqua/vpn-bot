import type { Message } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../core/contracts';
import type { CommandContext } from '../../core/global.handler';

export class XUICommandsHandler implements ICommandHandler {
	handle(context: CommandContext, message: Message, start?: boolean) {}
}
