import type { Message } from 'node-telegram-bot-api';
import { formatDate, isAdmin } from '../core';
import bot from '../core/bot';
import { getUserContactKeyboard } from '../core/buttons';
import { CommandScope, UserRequest, VPNProtocol } from '../core/enums';
import { globalHandler, type CommandDetailCompressed, type CommandDetails } from '../core/global.handler';
import logger from '../core/logger';
import { logsService } from '../core/logs';
import { paymentsService } from '../entities/users/payments.service';
import { PlanRepository } from '../entities/users/plans.repository';
import { PlansService } from '../entities/users/plans.service';
import { UsersRepository, type VPNUser } from '../entities/users/users.repository';
import { SpendingCategory } from '@prisma/client';

const keysHelpMessage = Object.values(VPNProtocol)
	.filter(p => ![VPNProtocol.Outline, VPNProtocol.XUI].includes(p))
	.reduce((acc, curr) => {
		const current = `
/key create ${curr}
/key create ${curr} <username>
/key delete ${curr}
/key delete ${curr} <username> 
/key file ${curr} <username>
/keys ${curr}
	`;
		return acc + current;
	}, '');

const adminStartMessage = `
/keys
/key
/key create
${keysHelpMessage}
/key create outline
/key delete outline
/keys outline
/keys online
/user
/user create
/user delete
/user pay
/users
/users sync
/payments
`;

const userStartMessage = `Добро пожаловать в бот тессеракт впн. 
/me — для просмотра информации, которая хранится о вас
/payments — для просмотра истории ваших платежей
`;

const usersRepository = new UsersRepository();

const plansService = new PlansService(new PlanRepository());

bot.onText(/\/start/, async (msg: Message) => {
	logger.success('Ready');
	if (isAdmin(msg)) {
		await bot.sendMessage(msg.chat.id, '✅ Ready');
		await bot.sendMessage(msg.chat.id, adminStartMessage);
	} else {
		const user = await usersRepository.getByTelegramId(msg.from.id.toString());
		if (user) {
			await bot.sendMessage(msg.chat.id, `Здравствуйте, ${user.firstName}!`);
		}
		await bot.sendMessage(msg.chat.id, userStartMessage);
	}
});

bot.on('message', async (msg: Message) => {
	logger.log(`${msg.from.id} (${msg.from.first_name}) — ${msg.text}`);

	if (msg.text && ['cancel', 'Cancel'].includes(msg.text)) {
		await bot.sendMessage(msg.chat.id, 'Отправлена команда отмены всех других команд');
		globalHandler.finishCommand();
		return;
	}

	if (globalHandler.hasActiveCommand()) {
		globalHandler.handleNewMessage(msg);
		return;
	}
	if (msg.user_shared) {
		await bot.sendMessage(msg.chat.id, `User id: ${msg.user_shared.user_id}`);
		globalHandler.handleNewMessage(msg);
	}
});

bot.onText(/\/ping$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.success('PONG');
	await bot.sendMessage(msg.chat.id, '✅ PONG');
});

bot.onText(/\/wg$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await logsService.wg(msg, '');
});

bot.onText(/\/wg\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	await logsService.wg(msg, ` ${match[1]}`);
});

bot.onText(/\/lookup/, async (msg: Message) => {
	await bot.sendMessage(msg.chat.id, 'Share user:', {
		reply_markup: getUserContactKeyboard(UserRequest.Lookup),
	});
});

bot.onText(/\/plans/, async (msg: Message) => {
	const plans = await plansService.getAll();
	for (const plan of plans) {
		await bot.sendMessage(
			msg.chat.id,
			`${plan.name}
Сумма: ${plan.amount} ${plan.currency} при цене ${plan.price} ${plan.currency}
Количество человек: ${plan.peopleCount}
Продолжительность: ${plan.months} месяцев`,
		);
	}
});

bot.on('poll', p => {
	globalHandler.handlePoll(p);
});

bot.on('callback_query', async query => {
	const callbackDataString = query.data;
	const parsed: CommandDetailCompressed = JSON.parse(callbackDataString);
	const data: CommandDetails = {
		scope: parsed.s,
		context: parsed.c,
		processing: Boolean(parsed.p),
	};
	globalHandler.execute(data, query.message);
});

bot.onText(/\/me/, async (msg: Message) => {
	const user = await usersRepository.getByTelegramId(msg.from.id.toString());
	if (user) {
		bot.sendMessage(msg.chat.id, formatUserInfo(user));
	} else {
		bot.sendMessage(msg.chat.id, 'Вы не зарегистрированы в системе');
	}
});

bot.onText(/\/payments/, async (msg: Message) => {
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

bot.onText(/\/spending$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Spendings,
			context: {},
		},
		msg,
	);
});

bot.onText(/\/spending\s+nalog/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Spendings,
			context: {
				category: SpendingCategory.Nalog,
			},
		},
		msg,
	);
});

bot.onText(/\/spending\s+servers/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Spendings,
			context: {
				category: SpendingCategory.Servers,
			},
		},
		msg,
	);
});

function formatUserInfo(user: VPNUser) {
	return `
О вас хранится следующая информация:
Username: ${user.username}
First Name: ${user.firstName}
Last Name: ${user.lastName}
Telegram Link: ${user.telegramLink}
Telegram Id: ${user.telegramId}
Devices: ${user.devices.join(', ')}
Protocols: ${user.protocols.join(', ')}
Created At: ${formatDate(user.createdAt)}
${user.bank ? 'Bank: ' + user.bank : ''}
${user.payer?.username ? 'Payer: ' + user.payer?.username : ''}${user.dependants?.length ? 'Dependants: ' + user.dependants?.map(u => u.username).join(', ') : ''}
${user.active ? '' : 'Inactive'}
	`;
}
