import type { PlanRepository } from './plans.repository';

export class PlansService {
	constructor(private readonly repo: PlanRepository) {}
	async getAll() {
		return await this.repo.getAll();
	}
}
