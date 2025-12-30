import type { Message } from 'node-telegram-bot-api';
import bot from '../bot';
import { PaymentsService } from '../entities/payments/payments.service';
import { UsersRepository } from '../entities/users/users.repository';
import { CmdCode, CommandScope, PaymentCommand, VPNUserCommand } from '../enums';
import { globalHandler } from '../global.handler';
import { isAdmin } from '../utils';
import { paymentButtons } from '../entities/payments/payments.buttons';
import TelegramBot from 'node-telegram-bot-api';

export const paymentCommandsList = {
	menu: {
		regexp: /\/payment$/,
		docs: '/payment — show payments menu',
	},
	all: {
		regexp: /\/payments$/,
		docs: '/payments — show payments list',
	},
	getById: {
		regexp: /\/payment\s+get/,
		docs: '/payment get — show payment by id',
	},
	findByDate: {
		regexp: /\/payment\s+date/,
		docs: '/payment date — find payments by date',
	},
	findByDateRange: {
		regexp: /\/payment\s+daterange/,
		docs: '/payment daterange — find payments by date',
	},
	sum: {
		regexp: /\/payments\s+sum/,
		docs: '/payments sum — show sum of payments',
	},
	delete: {
		regexp: /\/payment\s+delete/,
		docs: '/payment delete — delete payment',
	},
};
const paymentsService = new PaymentsService();

export const paymentsHelpMessage = Object.values(paymentCommandsList)
	.map(c => c.docs)
	.join('\n');

const usersRepository = new UsersRepository();

bot.onText(paymentCommandsList.menu.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: paymentButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select operation', inlineKeyboard);
});

bot.onText(paymentCommandsList.all.regexp, async (msg: Message) => {
	if (isAdmin(msg)) {
		globalHandler.execute(
			{
				scope: CommandScope.Payments,
				context: {
					cmd: PaymentCommand.List,
				},
			},
			{
				message: msg,
			} as TelegramBot.CallbackQuery,
		);
		return;
	}
	const user = await usersRepository.getByTelegramId(msg.from ? msg.from?.id.toString() : '');
	if (!user) {
		await bot.sendMessage(msg.chat.id, 'Вы не зарегистрированы в системе');
		return;
	}
	await paymentsService.showPayments(msg, {
		id: user.id.toString(),
		[CmdCode.Command]: VPNUserCommand.ShowPayments,
	});
});

bot.onText(paymentCommandsList.sum.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Payments,
			context: {
				cmd: PaymentCommand.Sum,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(paymentCommandsList.findByDate.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Payments,
			context: {
				cmd: PaymentCommand.FindByDate,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(paymentCommandsList.findByDateRange.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Payments,
			context: {
				cmd: PaymentCommand.FindByDateRange,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(paymentCommandsList.delete.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Payments,
			context: {
				cmd: PaymentCommand.Delete,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(paymentCommandsList.getById.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Payments,
			context: {
				cmd: PaymentCommand.GetById,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});
