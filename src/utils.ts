import { SendMessageOptions } from "node-telegram-bot-api";
import { DesktopOS, DeviceOS } from "@prisma/client";
import bot from "./services/bot";

export async function sendMessage(
	chatId: number,
	languageCode: string = "ru",
	code: string,
	message: string = "",
	options?: SendMessageOptions
): Promise<void> {
	const response = dictionary[code];
	let responseText =
		languageCode === "ru" ? response.ru : response.en;

	if (message && responseText.includes("%message%")) {
		responseText = responseText.replace("%message%", message);
	} else if (message) {
		responseText = responseText.concat(message);
	}
	await bot.sendMessage(chatId, responseText, options);
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
	unregistered: {
		ru: "К сожалению, пользователи с вашим username или id не зарегистрированы в системе",
		en: "Unfortunately we weren't able to find users with your telegram id or username"
	},
	start: {
		ru: "Здравствуйте! Это бот для работы с Dagon VPN https://t.me/dagonvpn. Бот напомнит, когда нужно платить за VPN, а также подскажет, какая информация хранится о вас в базе",
		en: "Hello! The bot is for Dagon VPN https://t.me/dagonvpn. It can remind when you have to pay and show information we store about you."
	},
	command_list: {
		ru: "Список команд",
		en: "Command list"
	},
	payment_date: {
		ru: "Вам нужно будет оплатить VPN не позднее. чем ",
		en: "Kindly note the due date for your VPN payment is "
	},
	payment_count: {
		ru: "Вы платите %message% рублей в месяц",
		en: "Your VPN payment fee is %message% roubles per month"
	},
	remind: {
		ru: "Дорогой клиент! Напоминаем вам о необходимости оплаты за Dagon VPN. Нам было бы приятно, если вы могли бы произвести оплату VPN завтра. Спасибо вам за ваше внимание и понимание.",
		en: "Dear valued customer! We kindly wish to remind you of the pending payment for Dagon VPN. Your prompt attention to this matter would be greatly appreciated. Tomorrow, if possible, we kindly request that you proceed with the payment for the VPN.\n" +
			"Thank you for your understanding and continued support."
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
