import type { Device, VPNProtocol } from '@prisma/client';
import type { Message, Poll, User } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../contracts';
import { Bank, VPNUserCommand } from '../../enums';
import { globalHandler } from '../../global.handler';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from './users.service';
import type { UserCreateCommandContext, UsersContext, UserUpdateCommandContext } from './users.types';
import logger from '../../logger';
import { PlansService } from '../plans/plans.service';
import TelegramBot from 'node-telegram-bot-api';

class UsersCommandsHandler implements ICommandHandler {
	constructor(
		private service: UsersService = new UsersService(),
		private paymentsService: PaymentsService = new PaymentsService(),
		private plansService: PlansService = new PlansService(),
	) {}
	private state = {
		params: new Map(),
		init: false,
	};
	async handle(context: UsersContext, message: Message, from: User, start = false) {
		context.chatId = message.chat.id;
		this.state.init = start;
		logger.log(`[users.handler.ts]: command: ${context.cmd}, start: ${start}`);
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
		if (context.cmd === VPNUserCommand.ExportExpenses) {
			await this.service.exportExpenses(message);
			this.state.init = false;
			globalHandler.finishCommand();
			return;
		}
		if (context.cmd === VPNUserCommand.ShowSubLink) {
			await this.service.showSubscriptionURL(message, from);
			globalHandler.finishCommand();
			return;
		}
		if (context.cmd === VPNUserCommand.ShowSubLinkGuide) {
			await this.service.showSubGuide(message, from);
			globalHandler.finishCommand();
			return;
		}
		if (context.cmd === VPNUserCommand.CreateSubscription) {
			await this.service.createSubscription(message, from);
			globalHandler.finishCommand();
			return;
		}
		if (context.cmd === VPNUserCommand.DeleteSubscription) {
			await this.service.deleteSubscription(message, from);
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
		if (context.cmd === VPNUserCommand.FindById) {
			await this.service.findById(message, this.state.init);
		}
		if (context.cmd === VPNUserCommand.Expand) {
			await this.service.expand(message, context);
		}
		if (context.cmd === VPNUserCommand.Update) {
			await this.service.update(message, context as UserUpdateCommandContext, this.state);
		}
		if (context.cmd === VPNUserCommand.UpdateNull) {
			(context as UserUpdateCommandContext).setNull = true;
			await this.service.update(message, context as UserUpdateCommandContext, this.state);
		}
		if (context.cmd === VPNUserCommand.Delete) {
			await this.service.delete(message, context, this.state.init);
			this.state.init = false;
		}
		if (context.cmd === VPNUserCommand.ShowPayments) {
			await this.paymentsService.showPayments(message, context, from);
		}
		if (context.cmd === VPNUserCommand.ShowUnpaid) {
			await this.service.showUnpaid(message);
		}
		if (context.cmd === VPNUserCommand.ShowPlans) {
			await this.plansService.showForUser(message, from);
		}
		if (context.cmd === VPNUserCommand.NotifyUnpaid) {
			await this.service.notifyUnpaid();
		}
		if (context.cmd === VPNUserCommand.ShowTrial) {
			await this.service.showTrial(message);
		}
		if (context.cmd === VPNUserCommand.AssignKey) {
			await this.service.createKey(message, context, start, true);
		}
		if (context.cmd === VPNUserCommand.CreateKey) {
			await this.service.createKey(message, context, start);
		}
		if (context.cmd === VPNUserCommand.Keys) {
			await this.service.listKeys(message, context);
		}
		if (context.cmd === VPNUserCommand.DeleteKey) {
			await this.service.deleteKey(message, context);
		}
		if (context.cmd === VPNUserCommand.UnassignKey) {
			await this.service.deleteKey(message, context, true);
		}
		if (context.cmd === VPNUserCommand.ShowMenu) {
			await this.service.showMenu(message, from);
		}
	}

	async handleQuery(context: UsersContext, query: TelegramBot.CallbackQuery, start = false) {
		this.handle(context, query.message, query.from, start);
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

export const userCommandsHandler = new UsersCommandsHandler(new UsersService(), new PaymentsService());
