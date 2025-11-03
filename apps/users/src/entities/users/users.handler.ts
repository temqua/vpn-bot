import type { Device, VPNProtocol } from '@prisma/client';
import type { Message, Poll } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../contracts';
import { Bank, VPNUserCommand } from '../../enums';
import { globalHandler } from '../../global.handler';
import { paymentsService, PaymentsService } from '../payments/payments.service';
import { usersService, UsersService } from './users.service';
import type { UserCreateCommandContext, UsersContext, UserUpdateCommandContext } from './users.types';

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
		if (context.cmd === VPNUserCommand.Export) {
			await this.service.export(message);
			this.state.init = false;
			globalHandler.finishCommand();
			return;
		}
		if (context.cmd === VPNUserCommand.ExportPayments) {
			await this.service.exportPayments(message);
			this.state.init = false;
			globalHandler.finishCommand();
			return;
		}
		if (context.cmd === VPNUserCommand.Pay) {
			await this.paymentsService.pay(message, context, this.state.init);
		}
		if (context.cmd === VPNUserCommand.Create) {
			await this.service.create(message, context as UserCreateCommandContext, this.state.init);
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
			await this.service.update(message, context as UserUpdateCommandContext, this.state);
		}
		if (context.cmd === VPNUserCommand.Delete) {
			await this.service.delete(message, context, this.state.init);
			this.state.init = false;
		}
		if (context.cmd === VPNUserCommand.ShowPayments) {
			await this.paymentsService.showPayments(message, context);
		}
		if (context.cmd === VPNUserCommand.ShowUnpaid) {
			await this.service.showUnpaid(message);
		}
		if (context.cmd === VPNUserCommand.ShowTrial) {
			await this.service.showTrial(message);
		}
	}

	async handlePoll(context: UsersContext, poll: Poll) {
		const selected = poll.options.filter(o => o.voter_count > 0).map(o => o.text as Device | VPNProtocol | Bank);
		if (context.cmd === VPNUserCommand.Create) {
			await this.service.create(null, context as UserCreateCommandContext, false, selected);
		} else if (context.cmd === VPNUserCommand.Update) {
			await this.service.update(null, context as UserUpdateCommandContext, this.state, selected);
		} else if (context.cmd === VPNUserCommand.Pay) {
			await this.paymentsService.pay(null, context, false);
		}
	}
}

export const userCommandsHandler = new UsersCommandsHandler(usersService, paymentsService);
