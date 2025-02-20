import { prisma } from '../../core/prisma';

export class PaymentsRepository {
	async create(userId: number, amount: number, monthsCount: number, expiresOn: Date, currency = 'RUB') {
		await prisma.payment.create({
			data: {
				userId,
				currency,
				amount,
				monthsCount,
				expiresOn,
			},
		});
	}
}
