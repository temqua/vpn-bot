import type { Payment } from '@prisma/client';
import { prisma } from '../../core/prisma';

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

	async findByUser(userId: number): Promise<Payment> {
		return await prisma.payment.findFirst({
			where: {
				userId,
			},
			orderBy: {
				paymentDate: 'desc',
			},
		});
	}
}
