import { prisma } from '../../core/prisma';

export class PaymentsRepository {
	async create(userId: number, amount: number, currency = 'RUB') {
		await prisma.payment.create({
			data: {
				userId,
				currency,
				amount,
			},
		});
	}
}
