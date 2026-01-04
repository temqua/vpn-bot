import type { CallbackQuery, Message, User } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../contracts';
import { CmdCode, PlanCommand } from '../../enums';
import { PlansService } from './plans.service';
import { PlansContext } from './plans.types';

export class PlansCommandsHandler implements ICommandHandler {
	constructor(private service: PlansService = new PlansService()) {}

	async handle(context: PlansContext, message: Message, from: User, start = false) {
		if (context[CmdCode.Command] === PlanCommand.List) {
			await this.service.showAll(message.chat.id);
		}
		if (context[CmdCode.Command] === PlanCommand.UpdateInit) {
			await this.service.initUpdate(message, context);
		}
		if (context[CmdCode.Command] === PlanCommand.Update) {
			await this.service.update(message, context, start);
		}
		if (context[CmdCode.Command] === PlanCommand.UpdateNull) {
			context.setNull = true;
			await this.service.update(message, context, start);
		}
		if (context[CmdCode.Command] === PlanCommand.Create) {
			await this.service.create(message, start);
		}
		if (context[CmdCode.Command] === PlanCommand.Delete) {
			await this.service.delete(message, context, start);
		}
	}

	handleQuery(context: PlansContext, query: CallbackQuery, start = false) {
		this.handle(context, query.message, query.from, start);
	}
}

export const plansCommandsHandler = new PlansCommandsHandler();
