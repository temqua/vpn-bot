import { Message } from "node-telegram-bot-api";
import { getUser } from "./controllers/users";
import { dictionary, bot } from "./main";

bot.onText(/\/ping (.+)/, (msg: Message, match: RegExpMatchArray) => {
  const chatId = msg.chat.id;
  const resp = match[1]; 
  bot.sendMessage(chatId, resp);
});

bot.onText(/Hello|Привет/, (msg: Message, match: RegExpMatchArray) => {
  const chatId: number = msg.chat.id;
  bot.sendMessage(
    chatId,
    `${dictionary.hello[msg.from.language_code]}, ${msg.from.first_name} ${msg.from.last_name}!`
  );
});


bot.onText(/\/user get (.+)/, async (msg: Message, match: RegExpMatchArray) => {
  const username = match[1]; 
  await getUser(msg, username);
});

