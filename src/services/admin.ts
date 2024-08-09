import bot from './bot';
import { isAdmin } from './auth';
import type { Message } from 'node-telegram-bot-api';

const internalCommandHandler = (callback: (msg: Message, match: RegExpMatchArray) => Promise<void>) => async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	return await callback(msg, match);
}

bot.onText(/\/user\s+file\s+(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const username = match[1];
	await getUserFile(msg, username);
});

bot.onText(/\/user\s+username=(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const username = match[1];
	const user = await getUser(msg, username);
	if (user) {
		await sendMessage(msg.chat.id, msg.from.language_code, 'found', `${formatUser(user)}`, {
			parse_mode: 'MarkdownV2',
		});
	} else {
		await sendMessage(msg.chat.id, msg.from.language_code, 'not_found');
	}
});

bot.onText(/\/user\s+tg=(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const username = match[1];
	const user = await getUserByTelegramUsername(msg, username);
	if (user) {
		await sendMessage(msg.chat.id, msg.from.language_code, 'found', `${formatUser(user)}`, {
			parse_mode: 'MarkdownV2',
		});
	} else {
		await sendMessage(msg.chat.id, msg.from.language_code, 'not_found');
	}
});

bot.onText(/(\/user\s+all|\/users)/, async (msg: Message) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const users = await getAllUsers(msg);
	if (users.length) {
		await sendMessage(msg.chat.id, msg.from.language_code, 'found');
	} else {
		await sendMessage(msg.chat.id, msg.from.language_code, 'not_found');
	}
	for (const user of users) {
		await bot.sendMessage(msg.chat.id, `${formatUser(user)}`, {
			parse_mode: 'MarkdownV2',
		});
	}
	await showIkeClients(msg);
});

bot.onText(/\/user\s+id=(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const userId = +match[1];
	const user = await getUserById(msg, userId);
	if (user) {
		await sendMessage(msg.chat.id, msg.from.language_code, 'found', `${formatUser(user)}`, {
			parse_mode: 'MarkdownV2',
		});
	} else {
		await sendMessage(msg.chat.id, msg.from.language_code, 'not_found');
	}
});

bot.onText(/\/user\s+create\s+(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const queryString = match[1];
	if (queryString === 'help') {
		await bot.sendMessage(
			msg.chat.id,
			`
/user create <querystring>— Send data about new user in query string format like this:
username=testuser&telegram_username=tttt&desktop_os=Windows&device_os=Android&first_name=Artem&last_name=N&phone=1234&payment_count=100&payment_day=1&paid_months_count=1&auto_pay=true`,
		);
		return;
	}
	const userData = querystring.decode(queryString);
	if (!userData.username) {
		await bot.sendMessage(msg.chat.id, 'Please provide username! It is required');
		return;
	}
	await createUser(msg, {
		desktopOS: getDesktopOS(userData.desktop_os?.toString()),
		deviceOS: getDeviceOS(userData.device_os?.toString()),
		firstName: userData.first_name?.toString(),
		lastName: userData.last_name?.toString(),
		languageCode: null,
		phone: userData.phone?.toString(),
		telegramId: null,
		telegramUsername: userData.telegram_username?.toString(),
		createDate: new Date(),
		paymentCount: Number(userData?.payment_count ?? 100),
		username: userData.username.toString(),
		paymentDay: Number(userData.payment_day ?? 1),
		paidMonthsCount: Number(userData.paid_months_count ?? 0),
		autoPay: userData?.auto_pay === 'true' ? true : false,
	});
});

bot.onText(/\/user\s+update\s+(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const queryString = match[1];
	if (queryString === 'help') {
		await bot.sendMessage(
			msg.chat.id,
			`
/user update <querystring>— Send data about new user in query string format like this:
telegram_username=tttt&desktop_os=Windows&device_os=Android&first_name=Artem&last_name=N&phone=1234456&payment_count=100&payment_day=1&paid_months_count=1&auto_pay=true`,
		);
		return;
	}
	const userData = querystring.decode(queryString);
	if (!userData.username) {
		await bot.sendMessage(msg.chat.id, 'Please provide username which user we updating!');
		return;
	}
	await updateUser(msg, userData.username as string, userData);
});

