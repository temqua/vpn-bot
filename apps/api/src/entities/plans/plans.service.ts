import { Injectable } from '@nestjs/common';
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
    if (queryParams.price && queryParams.count) {
      return await this.repository.findByPriceAndCount(
        Number(queryParams.price),
        Number(queryParams.count),
      );
    }
    if (queryParams.price) {
      return await this.repository.getByPrice(Number(queryParams.price));
    }
    if (queryParams.count) {
      return await this.repository.findByCount(Number(queryParams.count));
    }
    return await this.repository.getAll();
  }

  async findOne(id: number) {
    return await this.repository.getById(id);
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    return await this.repository.update(id, updatePlanDto);
  }

  async remove(id: number) {
    return await this.repository.delete(id);
  }
}
