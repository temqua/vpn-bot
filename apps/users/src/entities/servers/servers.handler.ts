import TelegramBot, { Message, User } from 'node-telegram-bot-api';
import { ICommandHandler } from '../../contracts';
import { ServersService } from './servers.service';
import { ServersContext } from './servers.types';
import { CmdCode, ServerCommand } from '../../enums';

class ServersCommandsHandler implements ICommandHandler {
	constructor(private service: ServersService = new ServersService()) {}

	async handle(context: ServersContext, message: Message, from: User, start = false) {
		if (context[CmdCode.Command] === ServerCommand.List) {
			await this.service.list(message);
		}
		if (context[CmdCode.Command] === ServerCommand.Delete) {
			await this.service.delete(message, context, start);
		}
		if (context[CmdCode.Command] === ServerCommand.Create) {
			await this.service.create(message, start);
		}
		if (context[CmdCode.Command] === ServerCommand.ListUsers) {
			await this.service.listServerUsers(message, context);
		}
	}

	async handleQuery(context: ServersContext, query: TelegramBot.CallbackQuery, start = false) {
		this.handle(context, query.message, query.from, start);
	}
}

export const serversCommandsHandler = new ServersCommandsHandler();
