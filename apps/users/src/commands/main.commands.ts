import type { Message } from 'node-telegram-bot-api';
import TelegramBot from 'node-telegram-bot-api';
import bot from '../bot';
import { dict } from '../dict';
import { getUserContactKeyboard, getUserKeyboard } from '../entities/users/users.buttons';
import { UsersRepository, type VPNUser } from '../entities/users/users.repository';
import { CmdCode, UserRequest } from '../enums';
import { globalHandler, type CommandDetailCompressed, type CommandDetails } from '../global.handler';
import logger from '../logger';
import { formatDate, isAdmin } from '../utils';
import { expenseHelpMessage } from './expenses.commands';
import { paymentsHelpMessage } from './payments.commands';
import { plansHelpMessage } from './plans.commands';
import { serversHelpMessage } from './servers.commands';
import { userHelpMessage } from './users.commands';
const usersRepository = new UsersRepository();

const mainCommandsList = {
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

bot.onText(/\/start/, async (msg: Message) => {
	logger.success('Ready');
	if (isAdmin(msg)) {
		await bot.sendMessage(msg.chat.id, '✅ Ready');
		await bot.sendMessage(msg.chat.id, mainHelpMessage);
		await bot.sendMessage(msg.chat.id, expenseHelpMessage);
		await bot.sendMessage(msg.chat.id, paymentsHelpMessage);
		await bot.sendMessage(msg.chat.id, userHelpMessage);
		await bot.sendMessage(msg.chat.id, plansHelpMessage);
		await bot.sendMessage(msg.chat.id, serversHelpMessage);
	} else {
		const user = await usersRepository.getByTelegramId(msg?.from?.id.toString() ?? '');
		if (user) {
			await bot.sendMessage(msg.chat.id, `Здравствуйте, ${msg?.from?.first_name}!`);
			bot.sendMessage(msg.chat.id, 'Добро пожаловать в бот тессеракт впн.');
			bot.sendMessage(msg.chat.id, dict.start[msg.from.language_code], getUserKeyboard());
		} else {
			await bot.sendMessage(
				msg.chat.id,
				`Здравствуйте, ${msg?.from?.first_name}! Напишите в личные сообщения https://t.me/tesseract_vpn для регистрации в системе.`,
			);
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

bot.on('callback_query', async (query: TelegramBot.CallbackQuery) => {
	const callbackDataString = query.data;
	try {
		bot.answerCallbackQuery(query.id);
	} catch (error) {
		logger.error(error);
	}
	if (callbackDataString) {
		const parsed: CommandDetailCompressed = JSON.parse(callbackDataString);
		const data: CommandDetails = {
			scope: parsed[CmdCode.Scope],
			context: parsed[CmdCode.Context],
			processing: Boolean(parsed[CmdCode.Processing]),
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
Имя: ${user.firstName}
Фамилия: ${user.lastName}
Ссылка на Telegram: ${user.telegramLink}
Telegram Id: ${user.telegramId}
Устройства: ${user.devices.join(', ')}
Дата создания: ${formatDate(user.createdAt)}
${user.bank ? 'Банк: ' + user.bank : ''}
${user.payer?.username ? 'Payer: ' + user.payer?.username : ''}${user.dependants?.length ? 'Dependants: ' + user.dependants?.map(u => u.username).join(', ') : ''}
${user.active ? '' : 'Неактивен'}
	`;
}
