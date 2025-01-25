import type { Message, ReplyKeyboardMarkup } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../core/contracts';
import { CommandScope, VPNUserCommand } from '../core/enums';
import { paymentsService } from '../services/payments';
import bot from '../services/bot';
import logger from '../core/logger';
import { globalHandler } from '../core/globalHandler';
import { usersService } from '../services/users';

export type UsersContext = {
	command: VPNUserCommand;
	id?: string;
};

class UsersCommandsHandler implements ICommandHandler {
	private state = {
		params: new Map(),
		firstStep: false,
	};

	async handle(context: UsersContext, message: Message, start = false) {
		this.state.firstStep = start;
		if (context.command === VPNUserCommand.Create) {
			await this.create(message);
		} else if (context.command === VPNUserCommand.Delete) {
			await this.delete(context, message);
		} else {
			await this.list(message);
		}
	}

	async create(message: Message) {
		if (this.state.firstStep) {
			await bot.sendMessage(message.chat.id, 'Enter new username');
			this.state.firstStep = false;
		} else if (!this.state.params.has('username')) {
			this.state.params.set('username', message.text);
			await bot.sendMessage(message.chat.id, 'Enter first name');
		} else if (!this.state.params.has('first_name')) {
			this.state.params.set('first_name', message.text);
			const replyMarkup: ReplyKeyboardMarkup = {
				keyboard: [
					[
						{
							text: 'Share user contact',
							request_user: {
								request_id: 1,
							},
						},
					],
				],
				one_time_keyboard: true, // The keyboard will hide after one use
				resize_keyboard: true, // Fit the keyboard to the screen size
			};

			bot.sendMessage(message.chat.id, 'Select new user:', {
				reply_markup: replyMarkup,
			});
		} else if (message.user_shared && !this.state.params.has('telegram_id')) {
			console.log('message.chat.username :>> ', message.chat.username);
			this.state.params.set('telegram_id', message.user_shared.user_id);
		} else {
			const params = this.state.params;
			await usersService.create(
				params.get('username'),
				params.get('first_name'),
				params.get('telegram_id'),
				null,
			);
			this.state.params.clear();
			globalHandler.finishCommand();
		}
	}

	async list(message: Message) {
		const users = await usersService.list();
		for (const user of users) {
			await bot.sendMessage(message.chat.id, JSON.stringify(user.username));
		}
		globalHandler.finishCommand();
	}

	async delete(context: UsersContext, message: Message) {
		if (this.state.firstStep) {
			this.state.firstStep = false;
			const users = await usersService.list();
			const buttons = users.map(({ username, id }) => [
				{
					text: username,
					callback_data: JSON.stringify({
						s: CommandScope.Users,
						c: {
							command: VPNUserCommand.Delete,
							id,
						},
						p: 1,
					}),
				},
			]);
			console.dir(buttons);
			const inlineKeyboard = {
				reply_markup: {
					inline_keyboard: [...buttons],
				},
			};
			await bot.sendMessage(message.chat.id, 'Select user to delete:', inlineKeyboard);
		} else {
			await bot.sendMessage(message.chat.id, 'Selected id: ' + context.id);
			// await usersService.delete(context.username);
			globalHandler.finishCommand();
		}
	}

	async pay(msg: Message) {
		if (msg.user_shared) {
			await paymentsService.pay(msg);
			logger.log(`Request ID: ${msg.user_shared.request_id}, ${msg.user_shared.user_id}`);
			await bot.sendMessage(msg.chat.id, `Request ID: ${msg.user_shared.request_id}, ${msg.user_shared.user_id}`);
		}
	}
}

export const userCommandsHandler = new UsersCommandsHandler();
