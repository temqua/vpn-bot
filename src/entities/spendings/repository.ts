import type { SpendingCategory } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../core/prisma';

export class SpendingsRepository {
	async create(category: SpendingCategory, amount: Decimal, description: string = '') {
		await prisma.spending.create({
			data: {
				category,
				amount,
				description,
			},
		});
	}

	async list() {
		return await prisma.spending.findMany();
	}
}
