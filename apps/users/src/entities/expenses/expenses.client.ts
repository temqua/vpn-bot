import { Expense, ExpenseCategory } from '@prisma/client';
import client from '../../api-client';
import { CreateExpenseDto, ExpenseSumDto } from './expenses.types';

export class ExpensesClient {
	async getAll(category?: ExpenseCategory): Promise<Expense[]> {
		const params = new URLSearchParams();
		if (category) {
			params.append('category', category);
		}
		const result = await client.get(`/expenses?${params}`);
		return result as Expense[];
	}

	async getById(id: string): Promise<Expense | null> {
		const result = await client.get(`/expenses/${id}`);
		return result as Expense;
	}

	async create(dto: CreateExpenseDto): Promise<Expense | null> {
		const result = await client.post(`/expenses`, {
			body: JSON.stringify(dto),
		});
		return result as Expense | null;
	}

	async update(id: string, dto: Partial<CreateExpenseDto>): Promise<Expense> {
		const result = await client.patch(`/expenses/${id}`, {
			body: JSON.stringify(dto),
		});
		return result as Expense;
	}

	async delete(id: string) {
		const result = await client.delete(`/expenses/${id}`);
		return result;
	}

	async sumNalogs(): Promise<ExpenseSumDto | null> {
		const result = await client.get('/expenses/sum?category=Nalog');
		return result as ExpenseSumDto;
	}

	async sumServers(): Promise<ExpenseSumDto | null> {
		const result = await client.get('/expenses/sum?category=Servers');
		return result as ExpenseSumDto;
	}

	async sum(): Promise<ExpenseSumDto | null> {
		const result = await client.get('/expenses/sum');
		return result as ExpenseSumDto;
	}

	async export() {
		return await client.post('/expenses/export');
	}
}
