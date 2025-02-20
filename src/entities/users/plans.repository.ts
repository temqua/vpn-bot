import { prisma } from '../../core/prisma';

export class PlanRepository {
	async findPlan(amount: number, price: number) {
		return await prisma.plan.findFirst({
			where: {
				amount,
				price,
			},
		});
	}
}
