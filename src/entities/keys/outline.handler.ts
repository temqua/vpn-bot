import type { Message } from 'node-telegram-bot-api';
import bot from '../../core/bot';
import type { ICommandHandler } from '../../core/contracts';
import { VPNKeyCommand } from '../../core/enums';
import { globalHandler } from '../../core/global.handler';
import type { KeysContext } from './keys.handler';
import { OutlineApiService } from './outline.api-service';
import { OutlineService } from './outline.service';

class OutlineCommandsHandler implements ICommandHandler {
	constructor(private service: OutlineService) {}
	private init = false;
	async handle(context: KeysContext, message: Message, start = false) {
		this.init = start;
		if (context.cmd === VPNKeyCommand.Create && start) {
			await bot.sendMessage(message.chat.id, 'Enter username');
			this.init = false;
			return;
		}
		if (context.cmd === VPNKeyCommand.Delete) {
			await this.service.delete(context.id, message.chat.id, this.init);
			this.init = false;
			return;
		}
		if (context.cmd === VPNKeyCommand.List) {
			await this.service.getAll(context, message, start);
			return;
		}
		if (context.cmd === VPNKeyCommand.GetUser) {
			await this.service.getUser(context.id, message.chat.id);
		}
		if (context.cmd === VPNKeyCommand.Create) {
			await this.service.create(message, message.text);
		}
		if (context.cmd === VPNKeyCommand.Rename) {
			await this.service.rename(context.id, message, start);
			return;
		}
		if (context.cmd === VPNKeyCommand.SetDataLimit) {
			await this.service.setDataLimit(context.id, message, start);
			return;
		}
		if (context.cmd === VPNKeyCommand.RemoveDataLimit) {
			await this.service.removeDataLimit(context.id, message);
		}
		globalHandler.finishCommand();
	}
}

export const outlineCommandsHandler = new OutlineCommandsHandler(new OutlineService(new OutlineApiService()));
