import type { Message } from 'node-telegram-bot-api';
import bot from '../bot';
import { createButtons, deleteButtons, keyButtons, showKeysButtons } from '../buttons';
import { servicesMap } from '../entities/keys/services-map';
import { CmdCode, CommandScope, VPNKeyCommand, VPNProtocol } from '../enums';
import { globalHandler } from '../global.handler';
import { isAdmin } from '../utils';

const keysHelpMessage = Object.values(VPNProtocol)
	.filter(p => ![VPNProtocol.Outline, VPNProtocol.XUI].includes(p))
	.reduce((acc, curr) => {
		const current = `
/key create ${curr}
/key create ${curr} <username>
/key delete ${curr}
/key delete ${curr} <username> 
/key file ${curr} <username>
/keys ${curr}
	`;
		return acc + current;
	}, '');

export const keyHelpMessage = `/keys
/key
/key create
/key delete
/key export
${keysHelpMessage}
/key create outline
/key delete outline
/keys outline
/key create xui
/key delete xui`;

bot.onText(/\/key$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: keyButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select operation', inlineKeyboard);
});

bot.onText(/\/keys$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: showKeysButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select protocol', inlineKeyboard);
});

bot.onText(/\/key\s+create$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: createButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select protocol:', inlineKeyboard);
});

bot.onText(/\/key\s+delete$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: deleteButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select protocol:', inlineKeyboard);
});

bot.onText(/\/key\s+export$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.Create,
				[CmdCode.Protocol]: VPNProtocol.OpenVPN,
			},
		},
		msg,
	);
});

bot.onText(/\/keys\s+online/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.GetOnline,
				[CmdCode.Protocol]: VPNProtocol.XUI,
			},
		},
		msg,
	);
});

bot.onText(/\/key\s+create\s+wg$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.Create,
				[CmdCode.Protocol]: VPNProtocol.WG,
			},
		},
		msg,
	);
});

bot.onText(/\/key\s+delete\s+wg$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.Delete,
				[CmdCode.Protocol]: VPNProtocol.WG,
			},
		},
		msg,
	);
});

bot.onText(/\/key\s+create\s+ikev2$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.Create,
				[CmdCode.Protocol]: VPNProtocol.IKEv2,
			},
		},
		msg,
	);
});

bot.onText(/\/key\s+delete\s+ikev2$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.Delete,
				[CmdCode.Protocol]: VPNProtocol.IKEv2,
			},
		},
		msg,
	);
});

bot.onText(/\/key\s+create\s+outline$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.Create,
				[CmdCode.Protocol]: VPNProtocol.Outline,
			},
		},
		msg,
	);
});

bot.onText(/\/key\s+delete\s+outline$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.Delete,
				[CmdCode.Protocol]: VPNProtocol.Outline,
			},
		},
		msg,
	);
});

bot.onText(/\/key\s+create\s+openvpn$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.Create,
				[CmdCode.Protocol]: VPNProtocol.OpenVPN,
			},
		},
		msg,
	);
});

bot.onText(/\/key\s+delete\s+openvpn$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.Delete,
				[CmdCode.Protocol]: VPNProtocol.OpenVPN,
			},
		},
		msg,
	);
});

bot.onText(/\/key\s+create\s+xui$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.Create,
				[CmdCode.Protocol]: VPNProtocol.XUI,
			},
		},
		msg,
	);
});

bot.onText(/\/key\s+delete\s+xui$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.Delete,
				[CmdCode.Protocol]: VPNProtocol.XUI,
			},
		},
		msg,
	);
});

bot.onText(/\/key\s+create\s+wg\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await createClient(msg, match, VPNProtocol.WG);
});

bot.onText(/\/key\s+create\s+ikev2\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await createClient(msg, match, VPNProtocol.IKEv2);
});

bot.onText(/\/key\s+create\s+openvpn\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await createClient(msg, match, VPNProtocol.OpenVPN);
});

bot.onText(/\/key\s+delete\s+wg\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await deleteClient(msg, match, VPNProtocol.WG);
});

bot.onText(/\/key\s+delete\s+ikev2\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await deleteClient(msg, match, VPNProtocol.IKEv2);
});

bot.onText(/\/key\s+delete\s+openvpn\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await deleteClient(msg, match, VPNProtocol.OpenVPN);
});

bot.onText(/\/key\s+file\s+wg\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await getFile(msg, match, VPNProtocol.WG);
});

bot.onText(/\/key\s+file\s+ikev2\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await getFile(msg, match, VPNProtocol.IKEv2);
});

bot.onText(/\/key\s+file\s+openvpn\s+(.*)/, async (msg: Message, match: RegExpMatchArray | null) => {
	await getFile(msg, match, VPNProtocol.OpenVPN);
});

bot.onText(/\/keys\s+ikev2/, async (msg: Message, match: RegExpMatchArray | null) => {
	await getClients(msg, match, VPNProtocol.IKEv2);
});

bot.onText(/\/keys\s+wg/, async (msg: Message, match: RegExpMatchArray | null) => {
	await getClients(msg, match, VPNProtocol.WG);
});

bot.onText(/\/keys\s+openvpn/, async (msg: Message, match: RegExpMatchArray | null) => {
	await getClients(msg, match, VPNProtocol.OpenVPN);
});

bot.onText(/\/keys\s+outline/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.List,
				[CmdCode.Protocol]: VPNProtocol.Outline,
			},
		},
		msg,
	);
});

bot.onText(/\/keys\s+xui/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Keys,
			context: {
				[CmdCode.Command]: VPNKeyCommand.List,
				[CmdCode.Protocol]: VPNProtocol.XUI,
			},
		},
		msg,
	);
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
	await servicesMap.get(protocol).create(msg, username);
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
	await servicesMap.get(protocol).delete(msg, username);
}

async function getClients(msg: Message, match: RegExpMatchArray | null, protocol: VPNProtocol) {
	if (!isAdmin(msg)) {
		return;
	}
	await servicesMap.get(protocol).getAll(msg);
}

async function getFile(msg: Message, match: RegExpMatchArray | null, protocol: VPNProtocol) {
	if (!isAdmin(msg)) {
		return;
	}
	if (!match) {
		await bot.sendMessage(msg.chat.id, 'Unexpected error happened with regexp match value');
		return;
	}
	await servicesMap.get(protocol).getFile(msg, match[1]);
}
