import type { Message } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../contracts';
import { CmdCode, PlanCommand } from '../../enums';
import { PlansService } from './plans.service';

export interface PlansContext {
	[CmdCode.Command]: PlanCommand;
}

export class PlansCommandsHandler implements ICommandHandler {
	constructor(private service: PlansService = new PlansService()) {}

	async handle(context: PlansContext, message: Message, start = false) {
		if (context.cmd === PlanCommand.List) {
			await this.service.showAll(message.chat.id);
		}
		if (context.cmd === PlanCommand.Create) {
			await this.service.create(message, start);
		}
	}
}

export const plansCommandsHandler = new PlansCommandsHandler();
