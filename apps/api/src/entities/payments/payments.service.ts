import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  constructor(private repository: PaymentsRepository) {}

  async create(createPaymentDto: CreatePaymentDto) {
    return await this.repository.create(createPaymentDto);
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: string) {
    const payment = await this.repository.findOne(id);
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    return await this.repository.update(id, updatePaymentDto);
  }

  async remove(id: string) {
    return await this.repository.remove(id);
  }

  async sum() {
    return await this.repository.sum();
  }
}
