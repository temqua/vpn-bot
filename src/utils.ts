import { Message, SendMessageOptions } from "node-telegram-bot-api";
import { DesktopOS, DeviceOS } from "@prisma/client";
import bot from "./services/bot";

export function sendMessage(
	received: Message,
	code: string,
	message: string = "",
	options?: SendMessageOptions
): void {
	const chatId = received.chat.id;
	const response = dictionary[code];
	let responseText =
		received.from.language_code === "ru" ? response.ru : response.en;
	if (message) {
		responseText = responseText.concat(message);
	}
	bot.sendMessage(chatId, responseText, options);
}

export interface Dictionary {
	[key: string]: {
		ru: string;
		en: string;
	};
}

export const dictionary: Dictionary = {
	forbidden: {
		ru: "Запрещённая команда",
		en: "Forbidden command"
	},
	else: {
		ru: "Что-нибудь ещё?",
		en: "Something else?"
	},
	hello: {
		ru: "Привет",
		en: "Hello"
	},
	found: {
		ru: "По запросу найдено следующее ",
		en: "Found next records "
	},
	not_found: {
		ru: "К сожалению, по вашему запросу ничего не найдено",
		en: "Not found any records for your request"
	},
	start: {
		ru: "Здравствуйте! Это бот для работы с Dagon VPN https://t.me/dagonvpn. Бот напомнит, когда нужно платить за VPN, а также подскажет, какая информация хранится о вас в базе",
		en: "Hello! The bot is for Dagon VPN https://t.me/dagonvpn. It can remind when you have to pay and show information we store about you."
	},
	command_list: {
		ru: "Список команд",
		en: "Command list"
	}
};

export const getDesktopOS = (os: string): DesktopOS => {
	switch (os) {
		case "Windows": {
			return DesktopOS.Windows;
		}
		case "macOS": {
			return DesktopOS.macOS;
		}
		default: {
			return DesktopOS.Linux;
		}
	}
};

export const getDeviceOS = (os: string): DeviceOS => {
	if (os === "Android") {
		return DeviceOS.Android;
	}
	return DeviceOS.iOS;
};
