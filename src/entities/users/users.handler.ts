import type { Message } from 'node-telegram-bot-api';
import bot from '../../core/bot';
import { createUserReply } from '../../core/buttons';
import type { ICommandHandler } from '../../core/contracts';
import { VPNUserCommand } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

export type UsersContext = {
	cmd: VPNUserCommand;
	id?: string;
	skip?: number;
};

class UsersCommandsHandler implements ICommandHandler {
	constructor(private service: UsersService) {}
	private state = {
		params: new Map(),
		init: false,
	};
	async handle(context: UsersContext, message: Message, start = false) {
		this.state.init = start;
		if (context.cmd === VPNUserCommand.List) {
			await this.service.list(message);
			this.state.init = false;
			globalHandler.finishCommand();
			return;
		}
		if (start && context.cmd === VPNUserCommand.Create) {
			await bot.sendMessage(message.chat.id, 'Share new user:', {
				reply_markup: createUserReply,
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
		if (context.cmd === VPNUserCommand.Delete) {
			await this.service.delete(message, context, this.state.init);
			this.state.init = false;
		}
		globalHandler.finishCommand();
	}
}

export const userCommandsHandler = new UsersCommandsHandler(new UsersService(new UsersRepository()));
