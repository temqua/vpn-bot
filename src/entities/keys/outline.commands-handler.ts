import type { Message } from 'node-telegram-bot-api';
import bot from '../../core/bot';
import type { ICommandHandler } from '../../core/contracts';
import { VPNKeyCommand } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import type { KeysContext } from './keys.commands-handler';
import { OutlineApiService } from './outline.api-service';
import { OutlineService } from './outline.service';

class OutlineCommandsHandler implements ICommandHandler {
	constructor(private service: OutlineService) {}
	private state = {
		firstStep: false,
	};
	async handle(context: KeysContext, message: Message, start = false) {
		this.state.firstStep = start;
		if (context.cmd === VPNKeyCommand.Create && start) {
			await bot.sendMessage(message.chat.id, 'Enter username');
			this.state.firstStep = false;
			return;
		}
		if (context.cmd === VPNKeyCommand.Delete) {
			await this.service.delete(context, message, this.state.firstStep);
			this.state.firstStep = false;
			return;
		}
		if (context.cmd === VPNKeyCommand.List) {
			await this.service.getAll(message);
		}
		if (context.cmd === VPNKeyCommand.GetUser) {
			await this.service.getUser(context, message);
		}
		if (context.cmd === VPNKeyCommand.Create) {
			await this.service.create(message, message.text);
		}
		globalHandler.finishCommand();
	}
}

export const outlineCommandsHandler = new OutlineCommandsHandler(new OutlineService(new OutlineApiService()));
