import type { Message, ReplyKeyboardMarkup } from 'node-telegram-bot-api';
import { isAdmin } from '../core';
import { createButtons, inlineButtons, showButtons } from '../core/buttons';
import { VPNProtocol } from '../core/enums';
import bot from '../services/bot';
import { keysService } from '../services/keys';

bot.onText(/\/user$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: inlineButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select command:', inlineKeyboard);
});

async function createClient(msg: Message, match: RegExpMatchArray | null, protocol: VPNProtocol) {
	if (!isAdmin(msg)) {
		return;
	}
	if (!match) {
		await bot.sendMessage(msg.chat.id, 'Unexpected error happened with regexp match value');
		return;
	}
	const username = match[1];
	await keysService.create(msg, username, protocol);
}

async function deleteClient(msg: Message, match: RegExpMatchArray | null, protocol: VPNProtocol) {
	if (!isAdmin(msg)) {
		return;
	}
	if (!match) {
		await bot.sendMessage(msg.chat.id, 'Unexpected error happened with regexp match value');
		return;
	}
	const username = match[1];
	await keysService.delete(msg, username, protocol);
}

async function getClients(msg: Message, match: RegExpMatchArray, protocol: VPNProtocol) {
	if (!isAdmin(msg)) {
		return;
	}
	await keysService.getAll(msg, VPNProtocol.Outline);
}

async function getFile(msg: Message, match: RegExpMatchArray | null, protocol: VPNProtocol) {
	if (!isAdmin(msg)) {
		return;
	}
	if (!match) {
		await bot.sendMessage(msg.chat.id, 'Unexpected error happened with regexp match value');
		return;
	}
	await keysService.getFile(msg, match[1], protocol);
}

bot.onText(/\/user\s+create\s+wg\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await createClient(msg, match, VPNProtocol.WG);
});

bot.onText(/\/user\s+create\s+ikev2\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await createClient(msg, match, VPNProtocol.IKEv2);
});

bot.onText(/\/user\s+create\s+outline\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await createClient(msg, match, VPNProtocol.Outline);
});

bot.onText(/\/user\s+create\s+(ikev2|wg|outline)$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await bot.sendMessage(msg.chat.id, 'You should send command with username like /user create ikev2 bob');
});

bot.onText(/\/user\s+delete\s+wg\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await deleteClient(msg, match, VPNProtocol.WG);
});

bot.onText(/\/user\s+delete\s+ikev2\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await deleteClient(msg, match, VPNProtocol.IKEv2);
});

bot.onText(/\/user\s+delete\s+outline\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await deleteClient(msg, match, VPNProtocol.Outline);
});

bot.onText(/\/user\s+file\s+wg\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await getFile(msg, match, VPNProtocol.WG);
});

bot.onText(/\/user\s+file\s+ikev2\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await getFile(msg, match, VPNProtocol.IKEv2);
});

bot.onText(/\/users\s+ikev2/, async (msg: Message, match: RegExpMatchArray | null) => {
	await getClients(msg, match, VPNProtocol.IKEv2);
});

bot.onText(/\/users\s+wg/, async (msg: Message, match: RegExpMatchArray | null) => {
	await getClients(msg, match, VPNProtocol.WG);
});

bot.onText(/\/users\s+outline/, async (msg: Message, match: RegExpMatchArray | null) => {
	await getClients(msg, match, VPNProtocol.Outline);
});

bot.onText(/\/user\s+create/, async (msg: Message, match: RegExpMatchArray | null) => {
	await createClient(msg, match, VPNProtocol.IKEv2);
});

bot.onText(/\/users\s+new/, async (msg: Message, match) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: createButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select certificate to create:', inlineKeyboard);
});

bot.onText(/\/users$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: showButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select command:', inlineKeyboard);
});

bot.onText(/\/user\s+pay/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const replyMarkup: ReplyKeyboardMarkup = {
		keyboard: [
			[
				{
					text: 'Share contacts 📞',
					request_user: {
						request_id: 1,
					},
				},
			],
		],
		one_time_keyboard: true, // The keyboard will hide after one use
		resize_keyboard: true, // Fit the keyboard to the screen size
	};

	bot.sendMessage(msg.chat.id, 'Please share your contacts:', {
		reply_markup: replyMarkup,
	});
});

bot.onText(/\/users\s+(?!ikev2|wg|outline)(.*)/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await bot.sendMessage(msg.chat.id, 'Wrong command');
});
