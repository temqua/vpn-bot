import type { BotMessage } from '@prisma/client';
import prisma from './prisma';
import logger from './logger';

export async function getBotMessage(id: string): Promise<BotMessage | null> {
	logger.log(`attempt to get bot message by id ${id}`);
	return prisma.botMessage.findFirst({
		where: {
			id,
		},
	});
}
