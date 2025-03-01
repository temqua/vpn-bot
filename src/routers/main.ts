import type TelegramBot from 'node-telegram-bot-api';
import type { Message } from 'node-telegram-bot-api';
import { formatDate, isAdmin } from '../core';
import bot from '../core/bot';
import { getUserContactKeyboard } from '../core/buttons';
import { UserRequest, VPNProtocol } from '../core/enums';
import { globalHandler, type CommandDetailCompressed, type CommandDetails } from '../core/globalHandler';
import logger from '../core/logger';
import { logsService } from '../core/logs';
import { PlansService } from '../entities/users/plans.service';
import { PlanRepository } from '../entities/users/plans.repository';

const keysHelpMessage = Object.values(VPNProtocol)
	.filter(p => p !== VPNProtocol.Outline)
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

const startMessage = `
/keys
/key
/key create
${keysHelpMessage}
/key create outline
/key delete outline
/keys outline
/user
/user create
/user delete
/user pay
/users
/users sync
`;

const plansService = new PlansService(new PlanRepository());

bot.onText(/\/start/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.success('Ready');
	await bot.sendMessage(msg.chat.id, '✅ Ready');
	await bot.sendMessage(msg.chat.id, startMessage);
});

bot.on('message', async (msg: Message, metadata: TelegramBot.Metadata) => {
	logger.log(`${msg.from.id} (${msg.from.first_name}) — ${msg.text}`);
	if (!isAdmin(msg)) {
		await bot.sendMessage(msg.chat.id, 'Forbidden');
		return;
	}

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
	await logsService.wg(msg);
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
