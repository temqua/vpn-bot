import type { Message } from 'node-telegram-bot-api';
import bot from '../bot';
import { getUserContactKeyboard } from '../buttons';
import logger from '../logger';
import { PlansService } from '../entities/users/plans.service';
import { UsersRepository, type VPNUser } from '../entities/users/users.repository';
import { UserRequest } from '../enums';
import { globalHandler, type CommandDetailCompressed, type CommandDetails } from '../global.handler';
import { formatDate, isAdmin } from '../utils';
import { expenseHelpMessage } from './expenses.commands';
import { paymentsHelpMessage } from './payments.commands';
import { userHelpMessage } from './users.commands';
import ms from 'ms';
import { PaymentsService } from '../entities/payments/payments.service';

const userStartMessage = `Добро пожаловать в бот тессеракт впн. 
/me — для просмотра информации, которая хранится о вас
/payments — для просмотра истории ваших платежей
`;

const usersRepository = new UsersRepository();

const plansService = new PlansService();
const paymentsService = new PaymentsService();

const mainCommandsList = {
	plans: {
		regexp: /\/plans$/,
		docs: '/plans — show users plans',
	},
	ping: {
		regexp: /\/ping$/,
		docs: '/ping — test if bot working',
	},
	lookup: {
		regexp: /\/lookup$/,
		docs: '/lookup — see user telegram id',
	},
};

const mainHelpMessage = Object.values(mainCommandsList)
	.map(c => c.docs)
	.join('\n');

let showPaymentsJob;

bot.onText(/\/start/, async (msg: Message) => {
	logger.success('Ready');
	if (isAdmin(msg)) {
		await bot.sendMessage(msg.chat.id, '✅ Ready');
		await bot.sendMessage(msg.chat.id, mainHelpMessage);
		await bot.sendMessage(msg.chat.id, expenseHelpMessage);
		await bot.sendMessage(msg.chat.id, paymentsHelpMessage);
		await bot.sendMessage(msg.chat.id, userHelpMessage);
	} else {
		const user = await usersRepository.getByTelegramId(msg?.from?.id.toString() ?? '');
		if (user) {
			await bot.sendMessage(msg.chat.id, `Здравствуйте, ${user.firstName}!`);
		}
		await bot.sendMessage(msg.chat.id, userStartMessage);
		if (!showPaymentsJob) {
			showPaymentsJob = setInterval(() => {
				paymentsService.checkUnpaid(msg);
			}, ms('1d'));
		}
	}
});

bot.on('message', async (msg: Message) => {
	logger.log(`${msg?.from?.id} (${msg?.from?.first_name}) — ${msg.text}`);

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

bot.on('poll', p => {
	globalHandler.handlePoll(p);
});

bot.on('callback_query', async query => {
	const callbackDataString = query.data;
	if (callbackDataString) {
		const parsed: CommandDetailCompressed = JSON.parse(callbackDataString);
		const data: CommandDetails = {
			scope: parsed.s,
			context: parsed.c,
			processing: Boolean(parsed.p),
		};
		globalHandler.execute(data, query?.message);
	}
});

bot.onText(mainCommandsList.ping.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.success('PONG');
	await bot.sendMessage(msg.chat.id, '✅ PONG');
});

bot.onText(mainCommandsList.lookup.regexp, async (msg: Message) => {
	await bot.sendMessage(msg.chat.id, 'Share user:', {
		reply_markup: getUserContactKeyboard(UserRequest.Lookup),
	});
});

bot.onText(mainCommandsList.plans.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
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

bot.onText(/\/me$/, async (msg: Message) => {
	const user = await usersRepository.getByTelegramId(msg?.from?.id.toString() ?? '');
	if (user) {
		bot.sendMessage(msg.chat.id, formatUserInfo(user));
	} else {
		bot.sendMessage(msg.chat.id, 'Вы не зарегистрированы в системе');
	}
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
