import { PrismaClient } from "@prisma/client";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { getAllUsers, getUser, getUserById } from "./controllers/users";
import { dictionary } from "./utils";
const dotenv = require("dotenv");
dotenv.config();
const token: string = process.env.BOT_TOKEN;
export const bot: TelegramBot = new TelegramBot(token, { polling: true });
export const prisma = new PrismaClient();
export const adminChatId = 190349851;

bot.onText(/\/ping (.+)/, (msg: Message, match: RegExpMatchArray) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
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

bot.onText(/\/user get (.+)/, async (msg: Message, match: RegExpMatchArray) => {
  if (match[1] === "all") {
    await getAllUsers(msg);
  } else {
    const username = match[1];
    await getUser(msg, username);
  }
});

bot.onText(
  /\/user getById (.+)/,
  async (msg: Message, match: RegExpMatchArray) => {
    const userId = +match[1];
    await getUserById(msg, userId);
  }
);

// bot.onText(/\/user create (.+)/, async (msg: Message, match: RegExpMatchArray) => {
//   const username = match[1];
//   await getUser(msg, username);
// });
