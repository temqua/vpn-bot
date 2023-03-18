import { Message, SendMessageOptions } from "node-telegram-bot-api";
import { bot } from "./main";

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
    en: "Forbidden command",
  },
  else: {
    ru: "Что-нибудь ещё?",
    en: "Something else?",
  },
  hello: {
    ru: "Привет",
    en: "Hello",
  },
  found: {
    ru: "По запросу найдено следующее ",
    en: "Found next records ",
  },
  not_found: {
    ru: "По вашему запросу ничего не найдено",
    en: "Not found any records for your request",
  },
};
