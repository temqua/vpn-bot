import type { Message } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../core/contracts';
import { VPNKeyCommand, VPNProtocol } from '../../core/enums';
import bot from '../../core/bot';
import { globalHandler } from '../../core/globalHandler';
import { outlineCommandsHandler } from './outline.handler';
import { CertificatesService } from './certificates.service';
import commandsMap from './commandsMap';

export type KeysContext = {
	pr: VPNProtocol;
	cmd: VPNKeyCommand;
	id?: string;
};

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
