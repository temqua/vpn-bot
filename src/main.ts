import "./env";
import { Message } from "node-telegram-bot-api";
import querystring from "node:querystring";
import { createUser, getAllUsers, getUser, getUserById } from "./services/users";
import { dictionary, getDesktopOS, getDeviceOS } from "./utils";
import bot from "./services/bot";
import { isAdmin } from "./auth";

bot.onText(/\/ping$/, (msg: Message) => {
	const chatId = msg.chat.id;
	bot.sendMessage(chatId, "pong");
});

bot.onText(/Hello|Привет/, (msg: Message, match: RegExpMatchArray) => {
	const chatId: number = msg.chat.id;
	bot.sendMessage(
		chatId,
		`${dictionary.hello[msg.from.language_code]}, ${msg.from.first_name} ${
			msg.from.last_name
		}!`
	);
});

bot.onText(
	/\/user username=(.+)/,
	async (msg: Message, match: RegExpMatchArray) => {
		if (!isAdmin(msg)) {
			return;
		}
		const username = match[1];
		await getUser(msg, username);
	}
);

bot.onText(/\/user all/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await getAllUsers(msg);
});

bot.onText(/\/user id=(.+)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	const userId = +match[1];
	await getUserById(msg, userId);
});

bot.onText(
	/\/user create (.+)/,
	async (msg: Message, match: RegExpMatchArray) => {
		if (!isAdmin(msg)) {
			return;
		}
		const queryString = match[1];
		const userData = querystring.decode(queryString);
		await createUser(msg, {
			desktopOS: getDesktopOS(userData.desktop_os.toString()),
			deviceOS: getDeviceOS(userData.device_os.toString()),
			firstName: userData.first_name.toString(),
			lastName: userData.last_name.toString(),
			languageCode: userData.language_code.toString(),
			phone: userData.phone.toString(),
			telegramId: userData.telegram_id ? +userData.telegram_id : 0,
			telegramUsername: userData.telegram_username.toString(),
			createDate: new Date(),
			username: userData.username.toString(),
			paymentDate: new Date()
		});
	}
);
