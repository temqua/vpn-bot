import type { Device, VPNProtocol } from '@prisma/client';
import type { Message, Poll, User } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../contracts';
import { Bank, CmdCode, VPNUserCommand } from '../../enums';
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
		logger.log(`[users.handler.ts]: command: ${context[CmdCode.Command]}, start: ${start}`);
		if (context[CmdCode.Command] === VPNUserCommand.List) {
			await this.service.list(message);
			this.state.init = false;
			globalHandler.finishCommand();
			return;
		}
		if (context[CmdCode.Command] === VPNUserCommand.Export) {
			await this.service.export(message);
			this.state.init = false;
			globalHandler.finishCommand();
			return;
		}
		if (context[CmdCode.Command] === VPNUserCommand.ExportPayments) {
			await this.service.exportPayments(message);
			this.state.init = false;
			globalHandler.finishCommand();
			return;
		}
		if (context[CmdCode.Command] === VPNUserCommand.ExportExpenses) {
			await this.service.exportExpenses(message);
			this.state.init = false;
			globalHandler.finishCommand();
			return;
		}
		if (context[CmdCode.Command] === VPNUserCommand.ShowSubLink) {
			await this.service.showSubscriptionURL(message, from);
			globalHandler.finishCommand();
			return;
		}
		if (context[CmdCode.Command] === VPNUserCommand.ShowSubLinkGuide) {
			await this.service.showSubGuide(message, from);
			globalHandler.finishCommand();
			return;
		}
		if (context[CmdCode.Command] === VPNUserCommand.CreateSubscription) {
			await this.service.createSubscription(message, from);
			globalHandler.finishCommand();
			return;
		}
		if (context[CmdCode.Command] === VPNUserCommand.DeleteSubscription) {
			await this.service.deleteSubscription(message, from);
			globalHandler.finishCommand();
			return;
		}
		if (context[CmdCode.Command] === VPNUserCommand.Pay) {
			await this.paymentsService.pay(message, context, this.state.init);
		}
		if (context[CmdCode.Command] === VPNUserCommand.Create) {
			await this.service.create(message, context as UserCreateCommandContext, this.state.init);
		}
		if (context[CmdCode.Command] === VPNUserCommand.GetById) {
			await this.service.getById(message, context);
		}
		if (context[CmdCode.Command] === VPNUserCommand.FindByUsername) {
			await this.service.findByUsername(message, context, this.state.init);
		}
		if (context[CmdCode.Command] === VPNUserCommand.GetByTelegramId) {
			await this.service.getByTelegramId(message, this.state.init);
		}
		if (context[CmdCode.Command] === VPNUserCommand.FindByFirstName) {
			await this.service.findByFirstName(message, this.state.init);
		}
		if (context[CmdCode.Command] === VPNUserCommand.FindById) {
			await this.service.findById(message, context, this.state.init);
		}
		if (context[CmdCode.Command] === VPNUserCommand.Expand) {
			await this.service.expand(message, context);
		}
		if (context[CmdCode.Command] === VPNUserCommand.Update) {
			await this.service.update(message, context as UserUpdateCommandContext, this.state);
		}
		if (context[CmdCode.Command] === VPNUserCommand.UpdateNull) {
			(context as UserUpdateCommandContext).setNull = true;
			await this.service.update(message, context as UserUpdateCommandContext, this.state);
		}
		if (context[CmdCode.Command] === VPNUserCommand.Delete) {
			await this.service.delete(message, context, this.state.init);
			this.state.init = false;
		}
		if (context[CmdCode.Command] === VPNUserCommand.ShowPayments) {
			await this.paymentsService.showPayments(message, context, from);
		}
		if (context[CmdCode.Command] === VPNUserCommand.ShowUnpaid) {
			await this.service.showUnpaid(message);
		}
		if (context[CmdCode.Command] === VPNUserCommand.ShowPlans) {
			await this.plansService.showForUser(message, from);
		}
		if (context[CmdCode.Command] === VPNUserCommand.NotifyUnpaid) {
			await this.service.notifyUnpaid();
		}
		if (context[CmdCode.Command] === VPNUserCommand.ShowTrial) {
			await this.service.showTrial(message);
		}
		if (context[CmdCode.Command] === VPNUserCommand.AssignKey) {
			await this.service.createKey(message, context, start, true);
		}
		if (context[CmdCode.Command] === VPNUserCommand.CreateKey) {
			await this.service.createKey(message, context, start);
		}
		if (context[CmdCode.Command] === VPNUserCommand.Keys) {
			await this.service.listKeys(message, context);
		}
		if (context[CmdCode.Command] === VPNUserCommand.DeleteKey) {
			await this.service.deleteKey(message, context);
		}
		if (context[CmdCode.Command] === VPNUserCommand.UnassignKey) {
			await this.service.deleteKey(message, context, true);
		}
		if (context[CmdCode.Command] === VPNUserCommand.GetKeyFile) {
			await this.service.getKeyFile(message, context);
		}
		if (context[CmdCode.Command] === VPNUserCommand.ShowMenu) {
			await this.service.showMenu(message, from);
		}
	}

	async handleQuery(context: UsersContext, query: TelegramBot.CallbackQuery, start = false) {
		this.handle(context, query.message, query.from, start);
	}

	async handlePoll(context: UsersContext, poll: Poll) {
		const selected = poll.options.filter(o => o.voter_count > 0).map(o => o.text as Device | VPNProtocol | Bank);
		if (context[CmdCode.Command] === VPNUserCommand.Create) {
			await this.service.create(null, context as UserCreateCommandContext, false, selected);
		} else if (context[CmdCode.Command] === VPNUserCommand.Update) {
			await this.service.update(null, context as UserUpdateCommandContext, this.state, selected);
		} else if (context[CmdCode.Command] === VPNUserCommand.Pay) {
			await this.paymentsService.pay(null, context, false);
		}
	}
}

export const userCommandsHandler = new UsersCommandsHandler(new UsersService(), new PaymentsService());
