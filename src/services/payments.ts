import { PrismaClient } from '@prisma/client';
import type { Message } from 'node-telegram-bot-api';

const prisma = new PrismaClient();

export class PaymentsService {
	async pay(msg: Message) {
		const user = await prisma.user.findFirst({
			select: {
				telegramId: msg.user_shared.user_id,
			},
		});
		await prisma.payment.create({
			data: {
				user,
				userId: user.id,
			},
		});
	}
}

export const paymentsService = new PaymentsService();
