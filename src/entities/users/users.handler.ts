import type { User } from '@prisma/client';
import type { Message, Poll } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../core/contracts';
import { VPNUserCommand } from '../../core/enums';
import { globalHandler } from '../../core/globalHandler';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';
import { PlanRepository } from './plans.repository';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

export interface UsersContext {
	cmd: VPNUserCommand;
	id?: string;
	skip?: number;
	accept?: number;
	prop?: keyof User;
	chatId?: number;
	payerId?: string;
	subo?: VPNUserCommand;
}

class UsersCommandsHandler implements ICommandHandler {
	constructor(
		private service: UsersService,
		private paymentsService: PaymentsService,
	) {}
	private state = {
		params: new Map(),
		init: false,
	};
	async handle(context: UsersContext, message: Message, start = false) {
		context.chatId = message.chat.id;
		this.state.init = start;
		if (context.cmd === VPNUserCommand.List) {
			await this.service.list(message);
			this.state.init = false;
			globalHandler.finishCommand();
			return;
		}
		if (context.cmd === VPNUserCommand.Sync) {
			await this.service.sync(message);
			this.state.init = false;
			globalHandler.finishCommand();
			return;
		}
		if (context.cmd === VPNUserCommand.Pay) {
			await this.paymentsService.pay(message, context, this.state.init);
		}
		if (context.cmd === VPNUserCommand.Create) {
			await this.service.create(message, context, this.state.init);
		}
		if (context.cmd === VPNUserCommand.GetById) {
			await this.service.getById(message, context);
		}
		if (context.cmd === VPNUserCommand.FindByUsername) {
			await this.service.findByUsername(message, this.state.init);
		}
		if (context.cmd === VPNUserCommand.GetByTelegramId) {
			await this.service.getByTelegramId(message, this.state.init);
		}
		if (context.cmd === VPNUserCommand.FindByFirstName) {
			await this.service.findByFirstName(message, this.state.init);
		}
		if (context.cmd === VPNUserCommand.Expand) {
			await this.service.expand(message, context);
		}
		if (context.cmd === VPNUserCommand.Update) {
			await this.service.update(message, context, this.state);
		}
		if (context.cmd === VPNUserCommand.Delete) {
			await this.service.delete(message, context, this.state.init);
			this.state.init = false;
		}
		if (context.cmd === VPNUserCommand.ShowPayments) {
			await this.paymentsService.showPayments(message, context);
		}
	}

	async handlePoll(context: UsersContext, poll: Poll) {
		const selected = poll.options.filter(o => o.voter_count > 0).map(o => o.text);
		if (context.cmd === VPNUserCommand.Create) {
			await this.service.create(null, context, false, selected);
		} else if (context.cmd === VPNUserCommand.Update) {
			await this.service.update(null, context, this.state, selected);
		} else if (context.cmd === VPNUserCommand.Pay) {
			await this.paymentsService.pay(null, context, false);
		}
	}
}

export const userCommandsHandler = new UsersCommandsHandler(
	new UsersService(new UsersRepository()),
	new PaymentsService(new PaymentsRepository(), new PlanRepository(), new UsersRepository()),
);
