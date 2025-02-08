import type { Message } from 'node-telegram-bot-api';
import bot from '../../core/bot';
import type { ICommandHandler } from '../../core/contracts';
import { VPNKeyCommand, VPNProtocol } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import { CertificatesService } from './certificates.service';
import commandsMap from './commandsMap';
import { outlineCommandsHandler } from './outline.handler';

export interface KeysContext {
	pr: VPNProtocol;
	cmd: VPNKeyCommand;
	id?: string;
}

class KeysCommandsHandler implements ICommandHandler {
	async handle(context: KeysContext, message: Message, start = false) {
		if (context?.pr === VPNProtocol.Outline) {
			await outlineCommandsHandler.handle(context, message, start);
			return;
		}
		if (context.cmd === VPNKeyCommand.List) {
			await new CertificatesService(context.pr).getAll(message);
			globalHandler.finishCommand();
			return;
		}
		if (start) {
			await bot.sendMessage(message.chat.id, 'Enter username');
			return;
		}
		await bot.sendMessage(message.chat.id, `Selected operation ${context.cmd}`);
		const method = commandsMap[context.cmd];
		const service = new CertificatesService(context.pr);
		await service[method](message, message.text);
		globalHandler.finishCommand();
	}
}

export const keysCommandsHandler = new KeysCommandsHandler();
