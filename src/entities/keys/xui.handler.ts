import type { Message } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../core/contracts';
import { VPNKeyCommand } from '../../core/enums';
import type { KeysContext } from './keys.handler';
import { globalHandler } from '../../core/global.handler';
import { XUIService } from './xui.service';
import { XUIApiService } from './xui.api-service';

export class XUICommandsHandler implements ICommandHandler {
	constructor(private service: XUIService) {}

	async handle(context: KeysContext, message: Message, start?: boolean) {
		if (context.cmd === VPNKeyCommand.List) {
			await this.service.getAll(message.chat.id);
		}
		if (context.cmd === VPNKeyCommand.GetOnline) {
			await this.service.getOnline(message.chat.id);
		}
		globalHandler.finishCommand();
	}
}

export const xuiCommandsHandler = new XUICommandsHandler(new XUIService(new XUIApiService()));
