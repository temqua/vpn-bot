import { Message } from "node-telegram-bot-api";
import TelegramBot from "node-telegram-bot-api";
const dotenv = require("dotenv");
dotenv.config();
const token: string = process.env.BOT_TOKEN;
const bot: TelegramBot = new TelegramBot(token, { polling: true });
// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg: Message, match: RegExpMatchArray) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/Hello|Привет/, (msg: Message, match: RegExpMatchArray) => {
  const chatId: number = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Hello, ${msg.from.first_name} ${msg.from.last_name}!`
  );
});
