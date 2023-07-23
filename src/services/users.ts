import { VpnUser } from "@prisma/client";
import { Message } from "node-telegram-bot-api";
import prisma from "./prisma";
import { sendMessage } from "../utils";
import bot from "./bot";
import { PORT, TOKEN, VPN_SERVER_IP } from "../env";
import querystring from "node:querystring";

type ErrorResponse = {
	error: string;
}

export async function getUser(msg: Message, username: string): Promise<VpnUser | undefined> {
	console.log(
		`attempt to get user by username ${username} chat id ${msg.chat.id}`
	);
	return prisma.vpnUser.findFirst({
		where: {
			username: username
		}
	});
}

export async function getUserByTelegramUsername(msg: Message, username: string): Promise<VpnUser | undefined> {
	console.log(
		`attempt to get user by telegram username ${username} chat id ${msg.chat.id}`
	);
	return prisma.vpnUser.findFirst({
		where: {
			telegramUsername: username
		}
	});
}

export async function getUserByTelegramId(msg: Message, id: number): Promise<VpnUser | undefined> {
	console.log(
		`attempt to get user by telegram id ${id} chat id ${msg.chat.id}`
	);
	return prisma.vpnUser.findFirst({
		where: {
			telegramId: id
		}
	});
}

export async function getPaymentDate(msg: Message, id: number): Promise<Date> {
	console.log(
		`attempt to get user payment date by id ${id} chat id ${msg.chat.id}`
	);
	const user: VpnUser = await prisma.vpnUser.findFirst({
		where: {
			id: id
		}
	});
	return user.paymentDate;
}


export async function getUserById(msg: Message, userId: number): Promise<VpnUser | undefined> {
	console.log(`attempt to get user by id ${userId} chat id ${msg.chat.id}`);
	return prisma.vpnUser.findFirst({
		where: {
			id: userId
		}
	});
}

export async function getAllUsers(msg: Message): Promise<void> {
	console.log(`attempt to get all users chat id ${msg.chat.id}`);
	const users: VpnUser[] = await prisma.vpnUser.findMany();
	if (users && users.length) {
		console.log("attempt to load users :>> ", users);
		let chunksCount = users.length / 10;
		if (chunksCount === 0) {
			sendMessage(msg, "found", `\`\`\`${JSON.stringify(users)}\`\`\``, {
				parse_mode: "MarkdownV2"
			});
		}
		for (let index = 0; index < chunksCount; index++) {
			let chunk: VpnUser[] = users.slice(index * 10, 10);
			if (index === chunksCount - 1) {
				chunk = users.slice(index * 10);
			}
			sendMessage(msg, "found", `\`\`\`${JSON.stringify(chunk)}\`\`\``, {
				parse_mode: "MarkdownV2"
			});
		}
	} else {
		sendMessage(msg, "not_found");
	}
	const result = await fetch(`http://${VPN_SERVER_IP}:${PORT}/users`, {
		headers: {
			"Authorization": `Bearer ${TOKEN}`
		}
	});
	if (result.ok) {
		await bot.sendMessage(msg.chat.id, `${result.status} ${result.statusText} \n${await result.text()}`);
	} else {
		const error = <ErrorResponse>await result.json();
		await bot.sendMessage(msg.chat.id, `Error occurred while getting users list from server \n${result.status} ${result.statusText} \n${error.error}`);
	}
}

export async function createUser(msg: Message, user: NewUser): Promise<void> {
	try {
		const qs = querystring.encode({
			username: user.username
		});
		const result = await fetch(`http://${VPN_SERVER_IP}:${PORT}/user/create/?${qs}`, {
			headers: {
				"Authorization": `Bearer ${TOKEN}`
			}
		});
		if (result.ok) {
			await prisma.vpnUser.create({
				data: user
			});
			await bot.sendMessage(msg.chat.id, `${result.status} ${result.statusText} \n${await result.text()}`);
			await bot.sendMessage(msg.chat.id, "User has been successfully created");
		} else {
			await bot.sendMessage(msg.chat.id, `Error occurred while creating user\n${result.status} ${result.statusText} \n${await result.text()}`);
		}
	} catch (error) {
		await bot.sendMessage(msg.chat.id, `Error occurred while creating user\n${error}`);
	}
}

export async function getUserFile(msg: Message, username: string): Promise<void> {
	const qs = querystring.encode({
		username
	});
	try {
		const result = await fetch(`http://${VPN_SERVER_IP}:${PORT}/user/file/?${qs}`, {
			headers: {
				"Authorization": `Bearer ${TOKEN}`
			}
		});
		if (result.ok) {
			const file = await result.arrayBuffer();
			await bot.sendDocument(msg.chat.id, file as Buffer);
		} else {
			const error = <ErrorResponse>await result.json();
			await bot.sendMessage(msg.chat.id, `Error occurred while receiving file for ${username} \n${error.error}`);
		}
	} catch (error) {
		await bot.sendMessage(msg.chat.id, `Error occurred while receiving file for ${username} \n${error}`);
	}

}

export type NewUser = Omit<VpnUser, "id">;
