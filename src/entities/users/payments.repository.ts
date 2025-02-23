import type { Payment, User } from '@prisma/client';
import { prisma } from '../../core/prisma';

export type UserPayment = {
	user: User;
} & Payment;

export class PaymentsRepository {
	async create(
		userId: number,
		amount: number,
		monthsCount: number,
		expiresOn: Date,
		currency = 'RUB',
	): Promise<Payment> {
		return await prisma.payment.create({
			data: {
				userId,
				currency,
				amount,
				monthsCount,
				expiresOn,
			},
		});
	}

	async getLastPayment(userId: number): Promise<Payment> {
		return await prisma.payment.findFirst({
			where: {
				userId,
			},
			orderBy: {
				paymentDate: 'desc',
			},
		});
	}

	async getAllByUserId(userId: number): Promise<Payment[]> {
		return await prisma.payment.findMany({
			where: {
				userId,
			},
		});
	}
}
