import type { Plan } from '@prisma/client';
import { prisma } from '../../core/prisma';

export class PlanRepository {
	async findPlan(amount: number, price: number, peopleCount: number) {
		return await prisma.plan.findFirst({
			where: {
				amount,
				price,
				peopleCount,
			},
		});
	}

	async getAll(): Promise<Plan[]> {
		return await prisma.plan.findMany({
			orderBy: {
				price: 'desc',
			},
		});
	}
}
