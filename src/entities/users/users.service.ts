import type { Device, User, VPNProtocol } from '@prisma/client';
import type { InlineKeyboardButton, Message, SendBasicOptions } from 'node-telegram-bot-api';
import bot from '../../core/bot';
import { chooseUserReply, createUserOperationsKeyboard, skipKeyboard } from '../../core/buttons';
import { CommandScope, VPNUserCommand } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import pollOptions from '../../core/pollOptions';
import type { UsersContext } from './users.handler';
import { UsersRepository } from './users.repository';

export class UsersService {
	constructor(private repository: UsersRepository) {}

	private state = {
		params: new Map(),
		createSteps: {
			username: false,
			firstName: false,
			lastName: false,
			telegramLink: false,
			devices: false,
			protocols: false,
		},
	};

	async create(message: Message, context: UsersContext, selectedOptions: (Device | VPNProtocol)[] = []) {
		const chatId = message ? message.chat.id : context.chatId;
		if (message?.user_shared) {
			this.state.params.set('telegram_id', message.user_shared.user_id.toString());
			await bot.sendMessage(chatId, 'Enter new username');
			this.setCreateStep('username');
			return;
		}
		if (this.state.createSteps.username) {
			this.state.params.set('username', message.text);
			await bot.sendMessage(chatId, 'Enter first name');
			this.setCreateStep('firstName');
			return;
		}
		if (this.state.createSteps.firstName) {
			this.state.params.set('first_name', message.text);
			await bot.sendMessage(chatId, 'Enter last name', skipKeyboard);
			this.setCreateStep('lastName');
			return;
		}
		if (this.state.createSteps.lastName) {
			if (!context.skip) {
				this.state.params.set('last_name', message.text);
			}
			await bot.sendMessage(chatId, 'Enter telegram link', skipKeyboard);
			this.setCreateStep('telegramLink');
			return;
		}
		if (this.state.createSteps.telegramLink) {
			if (!context.skip) {
				this.state.params.set('telegram_link', message.text);
			}
			await bot.sendPoll(chatId, 'Choose devices', pollOptions.devices, {
				allows_multiple_answers: true,
			});
			this.setCreateStep('devices');
			return;
		}
		if (this.state.createSteps.devices) {
			this.state.params.set('devices', selectedOptions);
			await bot.sendPoll(chatId, 'Choose protocols', pollOptions.protocols, {
				allows_multiple_answers: true,
			});
			this.setCreateStep('protocols');
			return;
		}
		if (this.state.createSteps.protocols) {
			this.state.params.set('protocols', selectedOptions);
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
				params.get('devices'),
				params.get('protocols'),
			);
			await bot.sendMessage(
				chatId,
				`User successfully created 
		id: ${result.id}				
		Username: ${result.username} 
		First name: ${result.firstName}`,
				{
					parse_mode: 'MarkdownV2',
				},
			);
		} catch (error) {
			await bot.sendMessage(chatId, `Unexpected error occurred while creating user ${username}: ${error}`);
		} finally {
			this.state.params.clear();
			globalHandler.finishCommand();
		}
	}

	async list(message: Message) {
		const users = await this.repository.list();
		const chunkSize = 50;
		const buttons = users.map(({ id, username, firstName, lastName }) => [
			{
				text: `${username} (${firstName} ${lastName})`,
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
		const chunksCount = Math.ceil(buttons.length / chunkSize);
		for (let i = 0; i < chunksCount; i++) {
			const chunk = buttons.slice(i * chunkSize, i * chunkSize + chunkSize);
			const inlineKeyboard: SendBasicOptions = {
				reply_markup: {
					inline_keyboard: [...chunk],
				},
			};
			await bot.sendMessage(message.chat.id, `Select user (part ${i + 1}):`, inlineKeyboard);
		}

		await bot.sendMessage(message.chat.id, `Total count ${users.length}`);
	}

	async getById(message: Message, context: UsersContext) {
		const user = await this.repository.getById(Number(context.id));
		await bot.sendMessage(message.chat.id, this.formatUserInfo(user), {
			parse_mode: 'MarkdownV2',
		});
		await bot.sendMessage(message.chat.id, 'Available operations', createUserOperationsKeyboard(user.id));
		globalHandler.finishCommand();
	}

	async update(
		message: Message,
		context: UsersContext,
		state: { init: boolean },
		selectedOptions: (Device | VPNProtocol)[] = [],
	) {
		const textProps = ['telegramLink', 'firstName', 'lastName', 'username'];
		const textProp = textProps.includes(context.prop);
		if (state.init) {
			if (textProp) {
				await bot.sendMessage(message.chat.id, `Enter ${context.prop}`);
			} else if (context.prop === 'telegramId') {
				await bot.sendMessage(message.chat.id, 'Share new user:', {
					reply_markup: chooseUserReply,
				});
			} else {
				await bot.sendPoll(message.chat.id, `Select ${context.prop}`, pollOptions[context.prop], {
					allows_multiple_answers: true,
				});
			}
			state.init = false;
			return;
		}
		if (selectedOptions.length) {
			const updated = await this.repository.update(context.id, {
				[context.prop]: selectedOptions,
			});
			await bot.sendMessage(context.chatId, this.formatUserInfo(updated), {
				parse_mode: 'MarkdownV2',
			});
			globalHandler.finishCommand();
			return;
		}
		const updated = await this.repository.update(context.id, {
			[context.prop]: textProp ? message.text : message.user_shared.user_id.toString(),
		});
		await bot.sendMessage(message.chat.id, this.formatUserInfo(updated), {
			parse_mode: 'MarkdownV2',
		});
		globalHandler.finishCommand();
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

	async pay(message: Message, context: UsersContext) {
		const user = await this.repository.getById(Number(context.id));
		await bot.sendMessage(message.chat.id, `Pay operation for user ${user.username}`);
	}

	private setCreateStep(current: string) {
		Object.keys(this.state.createSteps).forEach(k => {
			this.state.createSteps[k] = false;
			this.state.createSteps[current] = true;
		});
	}

	private formatUserInfo(user: User) {
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
