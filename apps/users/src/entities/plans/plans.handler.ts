import type { Message } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../contracts';
import { PlanCommand } from '../../enums';
import { PlansService } from './plans.service';
import { PlansContext } from './plans.types';

export class PlansCommandsHandler implements ICommandHandler {
	constructor(private service: PlansService = new PlansService()) {}

	async handle(context: PlansContext, message: Message, start = false) {
		if (context.cmd === PlanCommand.List) {
			await this.service.showAll(message.chat.id);
		}
		if (context.cmd === PlanCommand.Create) {
			await this.service.create(message, start);
		}
		if (context.cmd === PlanCommand.Delete) {
			await this.service.delete(message, context, start);
		}
	}
}

export const plansCommandsHandler = new PlansCommandsHandler();
