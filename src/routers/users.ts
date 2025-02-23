import type { Message } from 'node-telegram-bot-api';
import { isAdmin } from '../core';
import bot from '../core/bot';
import { userButtons } from '../core/buttons';
import { CommandScope, VPNUserCommand } from '../core/enums';
import { globalHandler, type CommandDetails } from '../core/globalHandler';
import { PaymentsRepository } from '../entities/users/payments.repository';
import { UsersRepository } from '../entities/users/users.repository';
import { UsersService } from '../entities/users/users.service';
import { PlanRepository } from '../entities/users/plans.repository';

const usersService = new UsersService(new UsersRepository(), new PaymentsRepository(), new PlanRepository());

bot.onText(/\/user$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: userButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select command:', inlineKeyboard);
});

bot.onText(/\/users$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const data: CommandDetails = {
		scope: CommandScope.Users,
		context: {
			cmd: VPNUserCommand.List,
		},
	};
	globalHandler.execute(data, msg);
});

bot.onText(/\/user\s+create$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const data: CommandDetails = {
		scope: CommandScope.Users,
		context: {
			cmd: VPNUserCommand.Create,
		},
	};
	globalHandler.execute(data, msg);
});

bot.onText(/\/user\s+delete$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const data: CommandDetails = {
		scope: CommandScope.Users,
		context: {
			cmd: VPNUserCommand.Delete,
		},
	};
	globalHandler.execute(data, msg);
});

bot.onText(/\/users\s+sync/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await usersService.sync(msg);
});

bot.onText(/\/user\s+pay/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				cmd: VPNUserCommand.Pay,
			},
		},
		msg,
	);
});
