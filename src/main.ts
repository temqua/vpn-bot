import { PrismaClient } from "@prisma/client";
import TelegramBot, { Message } from "node-telegram-bot-api";
const dotenv = require("dotenv");
dotenv.config();
const token: string = process.env.BOT_TOKEN;
export const bot: TelegramBot = new TelegramBot(token, { polling: true });
export const prisma = new PrismaClient();

export function sendMessage(received: Message, code: string, message: string = ""): void {
    const chatId = received.chat.id;
    const response = dictionary[code];
    const responseText = received.from.language_code === 'ru' ? response.ru : response.en;
    if (message) {
        responseText.concat(message);
    }
    bot.sendMessage(chatId, responseText);
}

export interface Dictionary {
  [key: string]: {
    ru: string,
    en: string
  }
}

export const dictionary: Dictionary = {
  forbidden: {
    ru: 'Запрещённая команда',
    en: 'Forbidden command'
  },
  else: {
    ru: 'Что-нибудь ещё?',
    en: 'Something else?'
  },
  hello: {
    ru: 'Привет',
    en: 'Hello'
  },
  found: {
    ru: 'По запросу найдено следующее: ',
    en: 'Found next records: '
  },
  not_found: {
    ru: 'По вашему запросу ничего не найдено',
    en: 'Not found any records for your request'
  }
}