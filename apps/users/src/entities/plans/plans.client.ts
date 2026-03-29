import { Plan } from '@prisma/client';
import client from '../../api-client';
import { CreatePlanDto } from './plans.types';

export class PlansClient {
	async getAll(price?: number): Promise<Plan[]> {
		const params = new URLSearchParams();
		if (price) {
			params.append('price', price.toString());
		}
		const result = await client.get(`/plans?${params}`);
		return result as Plan[];
	}

	async getById(id: number): Promise<Plan | null> {
		const result = await client.get(`/plans/${id}`);
		return result as Plan;
	}

	async create(dto: CreatePlanDto): Promise<Plan | null> {
		const result = await client.post(`/plans`, {
			body: JSON.stringify(dto),
		});
		return result as Plan | null;
	}

	async update(id: number, dto: Partial<CreatePlanDto>): Promise<Plan> {
		const result = await client.patch(`/plans/${id}`, {
			body: JSON.stringify(dto),
		});
		return result as Plan;
	}

	async delete(id: number) {
		const result = await client.delete(`/plans/${id}`);
		return result;
	}
}
