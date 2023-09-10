import { BotMessage } from "@prisma/client";
import prisma from "./prisma";

export async function getBotMessage(id: string): Promise<BotMessage | null> {
	console.log(`attempt to get bot message by id ${id}`);
	return prisma.botMessage.findFirst({
		where: {
			id,
		},
	});
}
