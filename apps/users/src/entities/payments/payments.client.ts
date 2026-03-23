import { Payment } from '@prisma/client';
import client from '../../api-client';
import { CreatePaymentDto } from './payments.types';

export class PaymentsClient {
	async getAll(): Promise<Payment[]> {
		const result = await client.get(`/payments`);
		return result as Payment[];
	}

	async getById(id: string): Promise<Payment | null> {
		const result = await client.get(`/payments/${id}`);
		return result as Payment;
	}

	async create(dto: CreatePaymentDto): Promise<Payment | null> {
		const result = await client.post(`/payments`, {
			body: JSON.stringify(dto),
		});
		return result as Payment | null;
	}

	async update(id: string, dto: Partial<CreatePaymentDto>): Promise<Payment> {
		const result = await client.patch(`/payments/${id}`, {
			body: JSON.stringify(dto),
		});
		return result as Payment;
	}

	async delete(id: string): Promise<Payment> {
		const result = await client.delete(`/payments/${id}`);
		return result as Payment;
	}
}
