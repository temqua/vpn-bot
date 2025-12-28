import type { Message } from 'node-telegram-bot-api';
import bot from '../../bot';
import { getProtocolButtons } from '../../buttons';
import type { ICommandHandler } from '../../contracts';
import { CmdCode, VPNKeyCommand, VPNProtocol } from '../../enums';
import { globalHandler } from '../../global.handler';
import logger from '../../logger';
import { commandsMap } from './commandsMap';
import { outlineCommandsHandler } from './outline/outline.handler';
import { servicesMap } from './services-map';
import { xuiCommandsHandler } from './xui/xui.handler';

export interface KeysContext {
	[CmdCode.Protocol]: VPNProtocol;
	[CmdCode.Command]: VPNKeyCommand;
	[CmdCode.SubOperation]?: VPNKeyCommand;
	id?: string;
	accept?: 1 | 0;
}

class KeysCommandsHandler implements ICommandHandler {
	async handle(context: KeysContext, message: Message, start = false) {
		if (context?.cmd === VPNKeyCommand.Expand) {
			if (context.subo) {
				bot.sendMessage(message.chat.id, 'Select protocol', {
					reply_markup: {
						inline_keyboard: [getProtocolButtons(context.subo)],
					},
				});
			} else {
				bot.sendMessage(message.chat.id, `context.subo ${context.subo} is null | undefined`);
			}

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
			const service = servicesMap.get(context[CmdCode.Protocol]);
			await service.getAll(message);
			globalHandler.finishCommand();
			return;
		}
		if ([VPNKeyCommand.Delete, VPNKeyCommand.GetFile, VPNKeyCommand.GetQR].includes(context?.cmd) && start) {
			const service = servicesMap.get(context[CmdCode.Protocol]);
			await service.getAll(message);
		}
		if (start) {
			await bot.sendMessage(message.chat.id, 'Enter username');
			return;
		}
		const method = commandsMap.get(context?.cmd);
		if (context?.cmd && method) {
			const service = servicesMap.get(context[CmdCode.Protocol]);
			await service[method](message, message?.text);
		} else {
			const errorMessage = `context is null or does not contain cmd ${context?.cmd} or method not found for this command`;
			logger.error(errorMessage);
			await bot.sendMessage(message.chat.id, errorMessage);
		}

		globalHandler.finishCommand();
	}
}

export const keysCommandsHandler = new KeysCommandsHandler();
