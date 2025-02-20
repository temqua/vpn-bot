import { prisma } from '../../core/prisma';

export class PlanRepository {
	async findPlanByAmount(amount: number) {
		return await prisma.plan.findFirst({
			where: {
				amount,
			},
		});
	}
}
