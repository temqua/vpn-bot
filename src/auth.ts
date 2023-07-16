import { VpnUser } from "@prisma/client";
import { sendMessage } from "./utils";
import prisma from "./services/prisma";
import { ADMIN_USER_ID } from "./env";

export const isAdmin = (msg): boolean => {
	if (msg.from.id !== ADMIN_USER_ID) {
		sendMessage(msg, "forbidden");
		sendMessage(msg, "else");
	}
	return msg.from.id === ADMIN_USER_ID;
};

export const isAdded = async (msg): Promise<boolean> => {
	const user: VpnUser = await prisma.vpnUser.findFirst({
		where: {
			telegramId: msg.from.id
		}
	});

	return !!user;
};
