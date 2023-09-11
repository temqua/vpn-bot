import "./env";
import { Message } from "node-telegram-bot-api";
import querystring from "node:querystring";
import {
	createUser,
	formatUser,
	getAllUsers,
	getUnpaid,
	getUser,
	getUserById,
	getUserByTelegramId,
	getUserByTelegramUsername,
	getUserFile,
	getUsersBeforePaying,
	payUser,
	payUserByUsername,
	showIkeClients,
	updatedPaidMonths,
	updateExistingUser,
	updateUser,
} from "./services/users";
import { dictionary, getDesktopOS, getDeviceOS, healthCheck, sendMessage } from "./utils";
import bot from "./services/bot";
import { isAdmin } from "./auth";
import { format } from "date-fns";
import enUS from "date-fns/locale/en-US";
import ru from "date-fns/locale/ru";
import ms from "ms";
import { getBotMessage } from "./services/messages";
import logger from "./services/logger";

setInterval(async () => {
	logger.log(`started job trying to get users before paying`);
	const users = await getUsersBeforePaying();
	for (const user of users) {
		await sendMessage(user.id, user.languageCode, "remind");
	}
	logger.success(`finished job for reminding users`);
}, ms("12h"));

setInterval(async () => {
	await updatedPaidMonths();
}, ms("1d"));

bot.onText(/\/start/, async (msg: Message) => {
	const startMessageEntry = await getBotMessage("start-message");
	let startMessage: string = startMessageEntry[msg.from.language_code ?? "en"];
	if (!startMessage) {
		startMessage = dictionary.start[msg.from.language_code ?? "en"];
	}
	await bot.sendMessage(msg.chat.id, startMessage);
	const user = await getUserByTelegramUsername(msg, msg.chat.username);
	if (user) {
		await updateExistingUser(msg, user);
	}
});

bot.onText(/\/pay/, async (msg: Message) => {
	await payUser(msg, 1);
});

bot.onText(/\/pay\s+(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	const data = match[1];
	const count = data !== "" ? +data : 1;
	if (isNaN(count)) {
		await sendMessage(msg.chat.id, msg.from.language_code, "invalid_message_pay");
	}
	await payUser(msg, count);
});

bot.onText(/\/user\s+pay\s+username=(.+)\s+(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	const username = match[1];
	const data = match[2];
	const count = data !== "" ? +data : 1;
	await payUserByUsername(msg, username, count);
});

bot.onText(/\/me/, async (msg: Message) => {
	if (!msg.from.username) {
		await sendMessage(msg.chat.id, msg.from.language_code, "enter_username", "``` /me artem ```", {
			parse_mode: "MarkdownV2",
		});
		return;
	}
	const user = await getUserByTelegramUsername(msg, msg.from.username);
	if (user) {
		await sendMessage(msg.chat.id, msg.from.language_code, "found", `${formatUser(user)}`, {
			parse_mode: "MarkdownV2",
		});
	} else {
		await sendMessage(msg.chat.id, msg.from.language_code, "enter_username", "``` /me artem ```", {
			parse_mode: "MarkdownV2",
		});
		return;
	}
});

bot.onText(/\/me\s+(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	const vpnUsername = match[1];
	const user = await getUser(msg, vpnUsername);
	await updateExistingUser(msg, user);
});

bot.onText(/\/user\s+help/, async (msg: Message) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const userHelp = await getBotMessage("users-help");
	await bot.sendMessage(msg.chat.id, userHelp[msg.from.language_code ?? "en"]);
});

bot.onText(/\/user\s+unpaid/, async (msg: Message) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	logger.log(`Attempt to get unpaid users`);
	const unpaid = await getUnpaid();
	if (unpaid.length) {
		for (const user of unpaid) {
			await sendMessage(msg.chat.id, msg.from.language_code, "found", formatUser(user), {
				parse_mode: "MarkdownV2",
			});
		}
	} else {
		await sendMessage(msg.chat.id, msg.from.language_code, "not_found");
	}
	logger.success("Successfully provided users who didn't pay for this month");
});

bot.onText(/\/remind/, async (msg: Message) => {
	let user = await getUserByTelegramId(msg, msg.from.id);
	if (!user) {
		user = await getUserByTelegramUsername(msg, msg.from.username);
		if (!user) {
			await sendMessage(msg.chat.id, msg.from.language_code, "unregistered");
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
		"payment_date",
		format(paymentDate, "do MMMM", {
			locale: msg.from.language_code === "ru" ? ru : enUS,
		}),
	);
	await sendMessage(msg.chat.id, msg.from.language_code, "payment_count", user.paymentCount.toString());
});

bot.onText(/\/ping$/, async (msg: Message) => {
	const chatId = msg.chat.id;
	await bot.sendMessage(chatId, "👋pong");
	await healthCheck(chatId);
});

bot.onText(/[Hh]ello|[Пп]ривет/, async (msg: Message, match: RegExpMatchArray) => {
	const chatId: number = msg.chat.id;
	await bot.sendMessage(
		chatId,
		`${dictionary.hello[msg.from.language_code]}, ${msg.from.first_name} ${msg.from.last_name}!`,
	);
});

bot.onText(/\/user\s+username=(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const username = match[1];
	const user = await getUser(msg, username);
	if (user) {
		await sendMessage(msg.chat.id, msg.from.language_code, "found", `${formatUser(user)}`, {
			parse_mode: "MarkdownV2",
		});
	} else {
		await sendMessage(msg.chat.id, msg.from.language_code, "not_found");
	}
});

bot.onText(/\/user\s+tg=(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const username = match[1];
	const user = await getUserByTelegramUsername(msg, username);
	if (user) {
		await sendMessage(msg.chat.id, msg.from.language_code, "found", `${formatUser(user)}`, {
			parse_mode: "MarkdownV2",
		});
	} else {
		await sendMessage(msg.chat.id, msg.from.language_code, "not_found");
	}
});

bot.onText(/(\/user\s+all|\/users)/, async (msg: Message) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const users = await getAllUsers(msg);
	if (users.length) {
		await sendMessage(msg.chat.id, msg.from.language_code, "found");
	} else {
		await sendMessage(msg.chat.id, msg.from.language_code, "not_found");
	}
	for (const user of users) {
		await bot.sendMessage(msg.chat.id, `${formatUser(user)}`, {
			parse_mode: "MarkdownV2",
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
		await sendMessage(msg.chat.id, msg.from.language_code, "found", `${formatUser(user)}`, {
			parse_mode: "MarkdownV2",
		});
	} else {
		await sendMessage(msg.chat.id, msg.from.language_code, "not_found");
	}
});

bot.onText(/\/user\s+create\s+(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const queryString = match[1];
	if (queryString === "help") {
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
		await bot.sendMessage(msg.chat.id, "Please provide username! It is required");
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
		autoPay: userData?.auto_pay === "true" ? true : false,
	});
});

bot.onText(/\/user\s+update\s+(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const queryString = match[1];
	if (queryString === "help") {
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
		await bot.sendMessage(msg.chat.id, "Please provide username which user we updating!");
		return;
	}
	await updateUser(msg, userData.username as string, userData);
});

bot.onText(/\/user\s+file\s+(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!(await isAdmin(msg))) {
		return;
	}
	const username = match[1];
	await getUserFile(msg, username);
});
