import type { Plan } from '@prisma/client';
import { prisma } from '../../prisma';

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
			orderBy: [
				{
					price: 'desc',
				},
				{
					peopleCount: 'asc',
				},
				{
					months: 'asc',
				},
			],
		});
	}

	async create(name: string, amount: number, price: number, peopleCount: number, monthsCount: number) {
		return await prisma.plan.create({
			data: {
				amount,
				price,
				months: monthsCount,
				name,
				peopleCount,
			},
		});
	}
}
