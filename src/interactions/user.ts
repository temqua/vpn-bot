import type { Message } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../core/contracts';
import type { VPNUserCommand } from '../core/enums';
import { paymentsService } from '../services/payments';
import bot from '../services/bot';
import logger from '../core/logger';

export type UsersContext = {};

class UsersCommandsHandler implements ICommandHandler {
	private state = {};

	handle(context: UsersContext, message: Message, start = false) {}

	async pay(msg: Message) {
		if (msg.user_shared) {
			await paymentsService.pay(msg);
			logger.log(`Request ID: ${msg.user_shared.request_id}, ${msg.user_shared.user_id}`);
			await bot.sendMessage(msg.chat.id, `Request ID: ${msg.user_shared.request_id}, ${msg.user_shared.user_id}`);
		}
	}
}

export const userCommandsHandler = new UsersCommandsHandler();
