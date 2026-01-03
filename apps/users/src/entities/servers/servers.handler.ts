import TelegramBot, { Message, User } from 'node-telegram-bot-api';
import { ICommandHandler } from '../../contracts';
import { CmdCode, ServerCommand } from '../../enums';
import { ServersService } from './servers.service';
import { ServersContext } from './servers.types';

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
		if (context[CmdCode.Command] === ServerCommand.ListKeys) {
			await this.service.listKeys(message, context, start);
		}
		if (context[CmdCode.Command] === ServerCommand.UpdateName) {
			await this.service.updateName(message, context, start);
		}
		if (context[CmdCode.Command] === ServerCommand.UpdateUrl) {
			await this.service.updateURL(message, context, start);
		}
	}

	async handleQuery(context: ServersContext, query: TelegramBot.CallbackQuery, start = false) {
		this.handle(context, query.message, query.from, start);
	}
}

export const serversCommandsHandler = new ServersCommandsHandler();
