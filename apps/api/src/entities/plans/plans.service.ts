import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlansRepository } from './plans.repository';
import { SearchPlanDto } from './dto/search-plan.dto';

@Injectable()
export class PlansService {
  constructor(private repository: PlansRepository) {}

  async create(createPlanDto: CreatePlanDto) {
    return await this.repository.create(
      createPlanDto.name,
      createPlanDto.amount,
      createPlanDto.price,
      createPlanDto.minCount,
      createPlanDto.maxCount,
      createPlanDto.monthsCount,
    );
  }

  async findAll(queryParams: SearchPlanDto) {
    if (queryParams.price && queryParams.count && queryParams.amount) {
      return await this.repository.findPlan(
        Number(queryParams.amount),
        Number(queryParams.price),
        Number(queryParams.count),
      );
    }
    if (queryParams.price && queryParams.count) {
      return await this.repository.findByPriceAndCount(
        Number(queryParams.price),
        Number(queryParams.count),
      );
    }
    if (queryParams.price && queryParams.amount) {
      return await this.repository.findByPriceAndAmount(
        Number(queryParams.price),
        Number(queryParams.amount),
      );
    }
    if (queryParams.price) {
      return await this.repository.getByPrice(Number(queryParams.price));
    }
    if (queryParams.count) {
      return await this.repository.findByCount(Number(queryParams.count));
    }
    if (queryParams.amount) {
      return await this.repository.findByAmount(Number(queryParams.amount));
    }
    return await this.repository.getAll();
  }

  async findOne(id: number) {
    const plan = await this.repository.getById(id);
    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
    return plan;
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    return await this.repository.update(id, updatePlanDto);
  }

  async remove(id: number) {
    return await this.repository.delete(id);
  }
}
