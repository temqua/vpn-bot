import { Message } from 'node-telegram-bot-api';
import bot from './bot';
import { getBotMessage } from './messages';
import { dictionary, healthCheck } from './utils';

bot.onText(/\/start/, async (msg: Message) => {
	const startMessageEntry = await getBotMessage('start-message');
	let startMessage: string = startMessageEntry[msg.from?.language_code ?? 'en'];
	if (!startMessage) {
		startMessage = dictionary.start[msg.from?.language_code ?? 'en'];
	}
	await bot.sendMessage(msg.chat.id, startMessage);
	// const user = await getUserByTelegramUsername(msg, msg.chat.username);
	// if (user) {
	// 	await updateExistingUser(msg, user);
	// }
});

// bot.onText(/\/me/, async (msg: Message) => {
// 	if (!msg.from.username) {
// 		await sendMessage(msg.chat.id, msg.from.language_code, 'enter_username', '``` /me artem ```', {
// 			parse_mode: 'MarkdownV2',
// 		});
// 		return;
// 	}
// 	const user = await getUserByTelegramUsername(msg, msg.from.username);
// 	if (user) {
// 		await sendMessage(msg.chat.id, msg.from.language_code, 'found', `${formatUser(user)}`, {
// 			parse_mode: 'MarkdownV2',
// 		});
// 	} else {
// 		await sendMessage(msg.chat.id, msg.from.language_code, 'enter_username', '``` /me artem ```', {
// 			parse_mode: 'MarkdownV2',
// 		});
// 		return;
// 	}
// });

// bot.onText(/\/me\s+(.+)/, async (msg: Message, match: RegExpMatchArray) => {
// 	const vpnUsername = match[1];
// 	const user = await getUser(msg, vpnUsername);
// 	await updateExistingUser(msg, user);
// });

bot.onText(/\/ping$/, async (msg: Message) => {
	const chatId = msg.chat.id;
	await bot.sendMessage(chatId, '👋pong');
});

bot.onText(/[Hh]ello|[Пп]ривет/, async (msg: Message) => {
	const chatId: number = msg.chat.id;
	await bot.sendMessage(
		chatId,
		`${dictionary.hello[msg.from?.language_code ?? 'en']}, ${msg.from?.first_name} ${msg.from?.last_name}!`,
	);
});
