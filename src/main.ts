import "./env";
import { Message } from "node-telegram-bot-api";
import querystring from "node:querystring";
import {
	createUser,
	getAllUsers,
	getPaymentDate,
	getUser,
	getUserById,
	getUserByTelegramId,
	getUserByTelegramUsername,
	getUserFile
} from "./services/users";
import { dictionary, getDesktopOS, getDeviceOS, sendMessage } from "./utils";
import bot from "./services/bot";
import { isAdmin } from "./auth";
import { format } from "date-fns";
import { DesktopOS, DeviceOS } from "@prisma/client";

const userHelp: string = `
/user all — list all users
/user id=<id> — get user by id
/user username=<username> — get user by dagon vpn username
/user tg=<telegram_username> — get user by telegram username
/user file <username> — get zip archive with vpn configs
/user create <querystring>— Send data about new user in query string format like this:
desktop_os=Windows&device_os=Android&first_name=Artem&last_name=N&language_code=ru&phone=1234456&telegram_username=tttt&username=testuser
`;

bot.onText(
	/\/start/,
	async (msg: Message) => {
		await sendMessage(msg, "start");
	}
);
bot.onText(/\/me/, async (msg: Message) => {
	const user = await getUserByTelegramUsername(msg, msg.chat.username);
	if (user) {
		sendMessage(msg, "found", `\`\`\`${JSON.stringify(user)}\`\`\``, {
			parse_mode: "MarkdownV2"
		});
	} else {
		sendMessage(msg, "not_found");
	}
});

bot.onText(
	/\/user help/,
	async (msg: Message) => {
		if (!isAdmin(msg)) {
			return;
		}
		await bot.sendMessage(msg.chat.id, userHelp);
	}
);

bot.onText(/\/create username=(.+) token=(.+)/, async (msg: Message) => {

});

bot.onText(/\/remind/, async (msg: Message) => {
	let user = await getUserByTelegramId(msg, msg.from.id);
	if (!user) {
		user = await getUserByTelegramUsername(msg, msg.from.username);
		if (!user) {
			sendMessage(msg, "unregistered");
			return;
		}
	}
	const paymentDate = await getPaymentDate(msg, user.id);
	sendMessage(msg, "payment_date", format(paymentDate, "do of MMMM"));
});


bot.onText(/\/ping$/, async (msg: Message) => {
	const chatId = msg.chat.id;
	await bot.sendMessage(chatId, "pong");
});

bot.onText(/Hello|Привет|hello|привет/, async (msg: Message, match: RegExpMatchArray) => {
	const chatId: number = msg.chat.id;
	await bot.sendMessage(
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
		const user = await getUser(msg, username);
		if (user) {
			sendMessage(msg, "found", `\`\`\`${JSON.stringify(user)}\`\`\``, {
				parse_mode: "MarkdownV2"
			});
		} else {
			sendMessage(msg, "not_found");
		}
	}
);

bot.onText(
	/\/user tg=(.+)/,
	async (msg: Message, match: RegExpMatchArray) => {
		if (!isAdmin(msg)) {
			return;
		}
		const username = match[1];
		const user = await getUserByTelegramUsername(msg, username);
		if (user) {
			sendMessage(msg, "found", `\`\`\`${JSON.stringify(user)}\`\`\``, {
				parse_mode: "MarkdownV2"
			});
		} else {
			sendMessage(msg, "not_found");
		}
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
	const user = await getUserById(msg, userId);
	if (user) {
		sendMessage(msg, "found", `\`\`\`${JSON.stringify(user)}\`\`\``, {
			parse_mode: "MarkdownV2"
		});
	} else {
		sendMessage(msg, "not_found");
	}
});

bot.onText(
	/\/user create (.+)/,
	async (msg: Message, match: RegExpMatchArray) => {
		if (!isAdmin(msg)) {
			return;
		}
		const queryString = match[1];
		const userData = querystring.decode(queryString);
		if (!userData.username) {
			await bot.sendMessage(msg.chat.id, "Please provide username! It is required");
		}
		await createUser(msg, {
			desktopOS: getDesktopOS(userData.desktop_os?.toString()) ?? DesktopOS.Windows,
			deviceOS: getDeviceOS(userData.device_os?.toString()) ?? DeviceOS.Android,
			firstName: userData.first_name?.toString() ?? "",
			lastName: userData.last_name?.toString() ?? "",
			languageCode: userData.language_code?.toString() ?? "",
			phone: userData.phone?.toString() ?? "",
			telegramId: userData.telegram_id ? +userData.telegram_id : 0,
			telegramUsername: userData.telegram_username?.toString() ?? "",
			createDate: new Date(),
			paymentCount: Number(userData?.payment_count) ?? 80,
			username: userData.username.toString(),
			paymentDate: new Date()
		});
	}
);

bot.onText(
	/\/user file (.+)/,
	async (msg: Message, match: RegExpMatchArray) => {
		if (!isAdmin(msg)) {
			return;
		}
		const username = match[1];
		await getUserFile(msg, username);
	}
);
