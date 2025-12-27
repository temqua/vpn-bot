import { Message } from 'node-telegram-bot-api';
import { ICommandHandler } from '../../contracts';
import { ServersService } from './servers.service';
import { ServersContext } from './servers.types';
import { ServerCommand } from '../../enums';

class ServersCommandsHandler implements ICommandHandler {
	constructor(private service: ServersService = new ServersService()) {}

	async handle(context: ServersContext, message: Message, start = false) {
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
}

export const serversCommandsHandler = new ServersCommandsHandler();
