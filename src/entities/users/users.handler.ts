import type { Message, Poll } from 'node-telegram-bot-api';
import bot from '../../core/bot';
import { chooseUserReply } from '../../core/buttons';
import type { ICommandHandler } from '../../core/contracts';
import { VPNUserCommand } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import type { User } from '@prisma/client';

export type UsersContext = {
	cmd: VPNUserCommand;
	id?: string;
	skip?: number;
	prop?: keyof User;
	chatId?: number;
};

class UsersCommandsHandler implements ICommandHandler {
	constructor(private service: UsersService) {}
	private state = {
		params: new Map(),
		init: false,
	};
	async handle(context: UsersContext, message: Message, start = false) {
		context.chatId = message.chat.id;
		this.state.init = start;
		if (context.cmd === VPNUserCommand.List) {
			await this.service.list(message);
			this.state.init = false;
			globalHandler.finishCommand();
			return;
		}
		if (start && context.cmd === VPNUserCommand.Create) {
			await bot.sendMessage(message.chat.id, 'Share new user:', {
				reply_markup: chooseUserReply,
			});
			this.state.init = false;
			return;
		}
		if (context.cmd === VPNUserCommand.Create) {
			await this.service.create(message, context);
		}
		if (context.cmd === VPNUserCommand.GetUser) {
			await this.service.getById(message, context);
		}
		if (context.cmd === VPNUserCommand.Update) {
			await this.service.update(message, context, this.state);
		}
		if (context.cmd === VPNUserCommand.Delete) {
			await this.service.delete(message, context, this.state.init);
			this.state.init = false;
		}
		if (context.cmd === VPNUserCommand.Pay) {
			await this.service.pay(message, context);
		}
	}

	async handlePoll(context: UsersContext, poll: Poll) {
		const selected = poll.options.filter(o => o.voter_count > 0).map(o => o.text);
		if (context.cmd === VPNUserCommand.Create) {
			await this.service.create(null, context, selected);
		} else {
			await this.service.update(null, context, this.state, selected);
		}
	}
}

export const userCommandsHandler = new UsersCommandsHandler(new UsersService(new UsersRepository()));
