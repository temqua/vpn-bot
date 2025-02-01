import type { Device, User, UserDevice, UserProtocol } from '@prisma/client';
import type { InlineKeyboardButton, Message, SendBasicOptions } from 'node-telegram-bot-api';
import bot from '../../core/bot';
import { skipKeyboard, createUserOperationsKeyboard, chooseUserReply } from '../../core/buttons';
import { CommandScope, VPNUserCommand } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import logger from '../../core/logger';
import { prisma } from '../../core/prisma';
import { paymentsService } from './payments';
import type { UsersContext } from './users.handler';
import { UsersRepository, type FullUserInfo } from './users.repository';

export class UsersService {
	constructor(private repository: UsersRepository) {}

	private state = {
		params: new Map(),
		createSteps: {
			username: false,
			firstName: false,
			lastName: false,
			telegramLink: false,
		},
	};

	async create(message: Message, context: UsersContext) {
		if (message.user_shared) {
			this.state.params.set('telegram_id', message.user_shared.user_id.toString());
			await bot.sendMessage(message.chat.id, 'Enter new username');
			this.setCreateStep('username');
			return;
		}
		if (this.state.createSteps.username) {
			this.state.params.set('username', message.text);
			await bot.sendMessage(message.chat.id, 'Enter first name');
			this.setCreateStep('firstName');
			return;
		}
		if (this.state.createSteps.firstName) {
			this.state.params.set('first_name', message.text);
			await bot.sendMessage(message.chat.id, 'Enter last name', skipKeyboard);
			this.setCreateStep('lastName');
			return;
		}
		if (this.state.createSteps.lastName) {
			if (!context.skip) {
				this.state.params.set('last_name', message.text);
			}
			await bot.sendMessage(message.chat.id, 'Enter telegram link', skipKeyboard);
			this.setCreateStep('telegramLink');
			return;
		}
		if (this.state.createSteps.telegramLink) {
			if (!context.skip) {
				this.state.params.set('telegram_link', message.text);
			}
		}
		const params = this.state.params;
		const username = params.get('username');
		try {
			const result = await this.repository.create(
				username,
				params.get('first_name'),
				params.get('telegram_id'),
				params.get('telegram_link'),
				params.get('last_name'),
			);
			await bot.sendMessage(
				message.chat.id,
				`User successfully created 
		id: ${result.id}				
		Username: ${result.username} 
		First name: ${result.firstName}`,
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
		const users = await this.repository.list();
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
			} as InlineKeyboardButton,
		]);
		const inlineKeyboard: SendBasicOptions = {
			reply_markup: {
				inline_keyboard: [...buttons],
			},
		};
		await bot.sendMessage(message.chat.id, 'Select user:', inlineKeyboard);
	}

	async getById(message: Message, context: UsersContext) {
		const user = await this.repository.getById(Number(context.id));
		await bot.sendMessage(message.chat.id, this.formatUserInfo(user), {
			parse_mode: 'MarkdownV2',
		});
		await bot.sendMessage(message.chat.id, 'Available operations', createUserOperationsKeyboard(user.id));
		globalHandler.finishCommand();
	}

	async update(message: Message, context: UsersContext, state: { init: boolean }) {
		const textProps = ['telegramLink', 'firstName', 'lastName'];
		const textProp = textProps.includes(context.prop);
		if (state.init) {
			if (textProp) {
				await bot.sendMessage(message.chat.id, `Enter ${context.prop}`);
			} else if (context.prop === 'telegramId') {
				await bot.sendMessage(message.chat.id, 'Share new user:', {
					reply_markup: chooseUserReply,
				});
			} else {
				await bot.sendMessage(message.chat.id, `Send poll`);
			}
			state.init = false;
			return;
		}
		await bot.sendMessage(message.chat.id, `You entered ${message.text}`);
		if (textProp) {
			this.applyUpdate(message, context, message.text);
		} else if (context.prop === 'telegramId') {
			this.applyUpdate(message, context, message.user_shared.user_id.toString());
		} else {
			await bot.sendMessage(message.chat.id, `Get from poll`);
		}
		globalHandler.finishCommand();
	}

	private async applyUpdate(message: Message, context: UsersContext, data) {
		const updated = await this.repository.update(context.id, {
			[context.prop]: data,
		});
		await bot.sendMessage(message.chat.id, this.formatUserInfo(updated), {
			parse_mode: 'MarkdownV2',
		});
	}

	async delete(message: Message, context: UsersContext, start: boolean) {
		if (!start) {
			await bot.sendMessage(message.chat.id, 'Selected id: ' + context.id);
			await this.repository.delete(Number(context.id));
			await bot.sendMessage(message.chat.id, `User with id ${context.id} has been successfully removed`);
			globalHandler.finishCommand();
			return;
		}
		const users = await this.repository.list();
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
	}

	async addDevice(telegramId: string, device: Device) {
		const user = await prisma.user.findFirstOrThrow({
			where: {
				telegramId,
			},
		});
		await prisma.userDevice.create({
			data: {
				userId: user.id,
				device,
			},
		});
	}

	async setFirstName(message: Message) {
		await bot.sendMessage(message.chat.id, 'Enter first name');
	}

	async pay(msg: Message) {
		if (msg.user_shared) {
			await paymentsService.pay(msg);
			logger.log(`Request ID: ${msg.user_shared.request_id}, ${msg.user_shared.user_id}`);
			await bot.sendMessage(msg.chat.id, `Request ID: ${msg.user_shared.request_id}, ${msg.user_shared.user_id}`);
		}
	}

	private setCreateStep(current: string) {
		Object.keys(this.state.createSteps).forEach(k => {
			this.state.createSteps[k] = false;
			this.state.createSteps[current] = true;
		});
	}

	private formatUserInfo(user: FullUserInfo) {
		return `
id: ${user.id}
username: \`${user.username}\`
First Name: \`${user.firstName}\`
Last Name: \`${user.lastName}\`
Created At: \`${user.createdAt.toISOString()}\`
Telegram Link: \`${user.telegramLink}\`
Telegram Id: \`${user.telegramId}\`
Price: \`${user.price}\`
Free: \`${user.free}\`
Devices: ${user.devices.join(', ')}
Protocols: ${user.protocols.join(', ')}
		`;
	}
}
