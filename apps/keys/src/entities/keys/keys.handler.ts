import type { Message } from 'node-telegram-bot-api';
import bot from '../../bot';
import { getProtocolButtons } from '../../buttons';
import type { ICommandHandler } from '../../contracts';
import { CmdCode, VPNKeyCommand, VPNProtocol } from '../../enums';
import { globalHandler } from '../../global.handler';
import { CertificatesService } from './certificates.service';
import commandsMap from './commandsMap';
import { outlineCommandsHandler } from './outline/outline.handler';
import { xuiCommandsHandler } from './xui/xui.handler';

export interface KeysContext {
	[CmdCode.Protocol]: VPNProtocol;
	[CmdCode.Command]: VPNKeyCommand;
	[CmdCode.SubOperation]?: VPNKeyCommand;
	id?: string;
	accept?: 1 | 0;
}

class KeysCommandsHandler implements ICommandHandler {
	async handle(context: KeysContext | null | undefined, message: Message, start = false) {
		if (context?.cmd === VPNKeyCommand.Expand) {
			await bot.sendMessage(message.chat.id, 'Select protocol', {
				reply_markup: {
					inline_keyboard: [getProtocolButtons(context.subo)],
				},
			});
			globalHandler.finishCommand();
			return;
		}
		if (context?.pr === VPNProtocol.Outline) {
			await outlineCommandsHandler.handle(context, message, start);
			return;
		}
		if (context?.pr === VPNProtocol.XUI) {
			await xuiCommandsHandler.handle(context, message, start);
			return;
		}
		if (context?.cmd === VPNKeyCommand.List) {
			await new CertificatesService(context[CmdCode.Protocol]).getAll(message);
			globalHandler.finishCommand();
			return;
		}
		if (start) {
			await bot.sendMessage(message.chat.id, 'Enter username');
			return;
		}
		const method = commandsMap[context.cmd];
		const service = new CertificatesService(context[CmdCode.Protocol]);
		await service[method](message, message.text);
		globalHandler.finishCommand();
	}
}

export const keysCommandsHandler = new KeysCommandsHandler();
