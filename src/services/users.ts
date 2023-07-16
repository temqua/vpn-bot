import { VpnUser } from "@prisma/client";
import { Message } from "node-telegram-bot-api";
import prisma from "./prisma";
import { sendMessage } from "../utils";
import bot from "./bot";
import { TOKEN, VPN_SERVER_IP } from "../env";
import querystring from "node:querystring";

export async function getUser(msg: Message, username: string): Promise<void> {
	console.log(
		`attempt to get user by username ${username} chat id ${msg.chat.id}`
	);
	const user: VpnUser = await prisma.vpnUser.findFirst({
		where: {
			username: username
		}
	});
	if (user) {
		sendMessage(msg, "found", `\`\`\`${JSON.stringify(user)}\`\`\``, {
			parse_mode: "MarkdownV2"
		});
	} else {
		sendMessage(msg, "not_found");
	}
}

export async function getUserById(msg: Message, userId: number): Promise<void> {
	console.log(`attempt to get user by id ${userId} chat id ${msg.chat.id}`);
	const user: VpnUser = await prisma.vpnUser.findFirst({
		where: {
			id: userId
		}
	});
	if (user) {
		sendMessage(msg, "found", `\`\`\`${JSON.stringify(user)}\`\`\``, {
			parse_mode: "MarkdownV2"
		});
	} else {
		sendMessage(msg, "not_found");
	}
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
}

export async function createUser(msg: Message, user: NewUser): Promise<void> {
	try {
		const qs = querystring.encode({
			username: user.username
		});
		const result = await fetch(`http://${VPN_SERVER_IP}/user/create/?${qs}`, {
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

export async function deleteUser(
	msg: Message,
	username: string
): Promise<void> {
}

export type NewUser = Omit<VpnUser, "id">;
