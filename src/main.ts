import { PrismaClient } from "@prisma/client";
import TelegramBot, { Message } from "node-telegram-bot-api";
import querystring from 'node:querystring';
import { createUser, getAllUsers, getUser, getUserById } from "./services/users";
import { dictionary } from "./utils";
const dotenv = require("dotenv");
dotenv.config();
const token: string = process.env.BOT_TOKEN;
export const bot: TelegramBot = new TelegramBot(token, { polling: true });
export const prisma = new PrismaClient();
export const adminUserId = 190349851;

bot.onText(/\/ping (.+)/, (msg: Message, match: RegExpMatchArray) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

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

bot.onText(/\/user get (.+)/, async (msg: Message, match: RegExpMatchArray) => {
  const username = match[1];
  await getUser(msg, username);
});

bot.onText(/\/user get all/, async (msg: Message) => {
  await getAllUsers(msg);
});

bot.onText(
  /\/user get id (.+)/,
  async (msg: Message, match: RegExpMatchArray) => {
    const userId = +match[1];
    await getUserById(msg, userId);
  }
);

bot.onText(/\/user create (.+)/, async (msg: Message, match: RegExpMatchArray) => {
  const queryString = match[1];
  const userData = querystring.decode(queryString);
  // await createUser(msg, username);
});

