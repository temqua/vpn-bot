import type { Message, ReplyKeyboardMarkup } from 'node-telegram-bot-api';
import bot from '../../core/bot';
import type { ICommandHandler } from '../../core/contracts';
import { CommandScope, VPNUserCommand } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import logger from '../../core/logger';
import { paymentsService } from './payments';
import { usersService } from './users.service';

export type UsersContext = {
	cmd: VPNUserCommand;
	id?: string;
	submit?: number;
};

const submitButton = {
	text: 'Submit',
	callback_data: JSON.stringify({
		s: CommandScope.Users,
		c: {
			cmd: VPNUserCommand.Create,
			submit: 1,
		},
		p: 1,
	}),
};

const skipButton = {
	text: 'Skip',
	callback_data: JSON.stringify({
		s: CommandScope.Users,
		c: {
			cmd: VPNUserCommand.Create,
			submit: 0,
			p: 'tid',
		},
		p: 1,
	}),
};

const inlineKeyboard = {
	reply_markup: {
		inline_keyboard: [[submitButton, skipButton]],
	},
};

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

class UsersCommandsHandler implements ICommandHandler {
	private state = {
		params: new Map(),
		firstStep: false,
	};
	private createSteps = {
		username: false,
		firstName: false,
		lastName: false,
		telegramLink: false,
	};
	async handle(context: UsersContext, message: Message, start = false) {
		this.state.firstStep = start;
		if (context.cmd === VPNUserCommand.Create) {
			await this.create(context, message);
		} else if (context.cmd === VPNUserCommand.Delete) {
			await this.delete(context, message);
		} else {
			await this.list(message);
		}
	}

	async create(context: UsersContext, message: Message) {
		if (this.state.firstStep) {
			await bot.sendMessage(message.chat.id, 'Share new user:', {
				reply_markup: replyMarkup,
			});
			this.state.firstStep = false;
			return;
		}
		if (message.user_shared) {
			this.state.params.set('telegram_id', message.user_shared.user_id.toString());
			await bot.sendMessage(message.chat.id, 'Enter new username');
			this.setCreateStep('username');
			return;
		}
		if (this.createSteps.username) {
			this.state.params.set('username', message.text);
			await bot.sendMessage(message.chat.id, 'Enter first name');
			this.setCreateStep('firstName');
			return;
		}
		if (this.createSteps.firstName) {
			this.state.params.set('first_name', message.text);
			await bot.sendMessage(message.chat.id, 'Add last name?', inlineKeyboard);
			this.setCreateStep('lastName');
			return;
		}
		if (this.createSteps.lastName) {
			if (context.submit) {
				this.state.params.set('last_name', message.text);
			}
			await bot.sendMessage(message.chat.id, 'Add telegram link?', inlineKeyboard);
			this.setCreateStep('telegramLink');
			return;
		}
		if (this.createSteps.telegramLink) {
			if (context.submit) {
				this.state.params.set('telegram_link', message.text);
			}
		}
		const params = this.state.params;
		const username = params.get('username');
		try {
			await usersService.create(
				username,
				params.get('first_name'),
				params.get('telegram_id'),
				params.get('telegram_link'),
			);
			await bot.sendMessage(
				message.chat.id,
				`User successfully created 
Username: ${username} 
First name: ${params.get('first_name')}`,
				{
					parse_mode: 'MarkdownV2',
				},
			);
		} catch (error) {
			await bot.sendMessage(
				message.chat.id,
				`Unexpected error occurred while creating user ${username}: ${error}`,
			);
		} finally {
			this.state.params.clear();
			globalHandler.finishCommand();
		}
	}

	async list(message: Message) {
		const users = await usersService.list();
		const buttons = users.map(({ id, username }) => [
			{
				text: username,
				callback_data: JSON.stringify({
					s: CommandScope.Users,
					c: {
						cmd: VPNUserCommand.GetUser,
						id,
					},
					p: 1,
				}),
			},
		]);
		const inlineKeyboard = {
			reply_markup: {
				inline_keyboard: [...buttons],
			},
		};
		await bot.sendMessage(message.chat.id, 'Select user:', inlineKeyboard);
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
							cmd: VPNUserCommand.Delete,
							id,
						},
						p: 1,
					}),
				},
			]);
			const inlineKeyboard = {
				reply_markup: {
					inline_keyboard: [...buttons],
				},
			};
			await bot.sendMessage(message.chat.id, 'Select user to delete:', inlineKeyboard);
		} else {
			await bot.sendMessage(message.chat.id, 'Selected id: ' + context.id);
			await usersService.delete(Number(context.id));
			await bot.sendMessage(message.chat.id, `User with id ${context.id} has been successfully removed`);
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

	private setCreateStep(current: string) {
		Object.keys(this.createSteps).forEach(k => {
			this.createSteps[k] = false;
			this.createSteps[current] = true;
		});
	}
}

export const userCommandsHandler = new UsersCommandsHandler();
