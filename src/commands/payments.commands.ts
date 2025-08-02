import type { Message } from 'node-telegram-bot-api';
import { isAdmin } from '../core';
import bot from '../core/bot';
import { paymentsService } from '../entities/users/payments.service';
import { UsersRepository } from '../entities/users/users.repository';

export const paymentCommandsList = {
	all: {
		regexp: /\/payments$/,
		docs: '/payments — show payments list',
	},
	sum: {
		regexp: /\/payments\s+sum/,
		docs: '/payments sum — show sum of payments',
	},
};

export const paymentsHelpMessage = Object.values(paymentCommandsList)
	.map(c => c.docs)
	.join('\n');

const usersRepository = new UsersRepository();

bot.onText(paymentCommandsList.all.regexp, async (msg: Message) => {
	if (isAdmin(msg)) {
		await paymentsService.showAll(msg);
		return;
	}
	const user = await usersRepository.getByTelegramId(msg.from.id.toString());
	if (!user) {
		await bot.sendMessage(msg.chat.id, 'Вы не зарегистрированы в системе');
		return;
	}
	await paymentsService.showPayments(msg, {
		id: user.id,
	});
});

bot.onText(paymentCommandsList.sum.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const sum = await paymentsService.sum();
	await bot.sendMessage(msg.chat.id, `Сумма всех платежей в системе: ${sum}`);
});
