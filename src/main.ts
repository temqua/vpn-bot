import { format } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import ru from 'date-fns/locale/ru';
import type { Message } from 'node-telegram-bot-api';
import querystring from 'node:querystring';
import { isAdmin } from './auth';
import './env';
import bot from './services/bot';
import { getBotMessage } from './services/messages';
import {
	createUser,
	formatUser,
	getAllUsers,
	getUser,
	getUserById,
	getUserByTelegramId,
	getUserByTelegramUsername,
	getUserFile,
	showIkeClients,
	updateExistingUser,
	updateUser,
} from './services/users';
import { dictionary, getDesktopOS, getDeviceOS, healthCheck, sendMessage } from './services/utils';



bot.onText(/\/user\s+help/, async (msg: Message) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const userHelp = await getBotMessage('users-help');
	await bot.sendMessage(msg.chat.id, userHelp[msg.from.language_code ?? 'en']);
});

bot.onText(/\/remind/, async (msg: Message) => {
	let user = await getUserByTelegramId(msg, msg.from.id);
	if (!user) {
		user = await getUserByTelegramUsername(msg, msg.from.username);
		if (!user) {
			await sendMessage(msg.chat.id, msg.from.language_code, 'unregistered');
			return;
		}
	}
	const paymentDate = new Date();
	if (user.paymentDay < paymentDate.getDate()) {
		paymentDate.setMonth(paymentDate.getMonth() + 1);
	}
	paymentDate.setDate(user.paymentDay);
	paymentDate.setHours(0, 0, 0, 0);
	await sendMessage(
		msg.chat.id,
		msg.from.language_code,
		'payment_date',
		format(paymentDate, 'do MMMM', {
			locale: msg.from.language_code === 'ru' ? ru : enUS,
		}),
	);
	await sendMessage(msg.chat.id, msg.from.language_code, 'payment_count', user.paymentCount.toString());
});
