import type { Plan } from '@prisma/client';
import { prisma } from '../../prisma';

export class PlanRepository {
	async findPlan(amount: number, price: number, count: number) {
		return await prisma.plan.findFirst({
			where: {
				amount,
				price,
				minCount: {
					lte: count,
				},
				maxCount: {
					gte: count,
				},
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
					maxCount: 'asc',
				},
				{
					months: 'asc',
				},
			],
		});
	}

	async getByPrice(price: number) {
		return await prisma.plan.findMany({
			where: {
				price,
			},
			orderBy: [
				{
					maxCount: 'asc',
				},
				{
					months: 'asc',
				},
			],
		});
	}

	async create(name: string, amount: number, price: number, minCount: number, maxCount: number, monthsCount: number) {
		return await prisma.plan.create({
			data: {
				amount,
				price,
				months: monthsCount,
				name,
				minCount,
				maxCount,
			},
		});
	}

	async update(id: number, data) {
		return await prisma.plan.update({
			where: {
				id,
			},
			data,
		});
	}

	async delete(id: number) {
		return await prisma.plan.delete({
			where: {
				id,
			},
		});
	}
}
