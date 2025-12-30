import TelegramBot, { Message, User } from 'node-telegram-bot-api';
import { ICommandHandler } from '../../contracts';
import { ServersService } from './servers.service';
import { ServersContext } from './servers.types';
import { ServerCommand } from '../../enums';

class ServersCommandsHandler implements ICommandHandler {
	constructor(private service: ServersService = new ServersService()) {}

	async handle(context: ServersContext, message: Message, from: User, start = false) {
		if (context.cmd === ServerCommand.List) {
			await this.service.list(message);
		}
		if (context.cmd === ServerCommand.Delete) {
			await this.service.delete(message, context, start);
		}
		if (context.cmd === ServerCommand.Create) {
			await this.service.create(message, start);
		}
		if (context.cmd === ServerCommand.ListUsers) {
			await this.service.listServerUsers(message, context);
		}
	}

	async handleQuery(context: ServersContext, query: TelegramBot.CallbackQuery, start = false) {
		this.handle(context, query.message, query.from, start);
	}
}

export const serversCommandsHandler = new ServersCommandsHandler();
