import { PlanRepository } from './plans.repository';

export class PlansService {
	constructor(private readonly repo: PlanRepository = new PlanRepository()) {}
	async getAll() {
		return await this.repo.getAll();
	}
}
