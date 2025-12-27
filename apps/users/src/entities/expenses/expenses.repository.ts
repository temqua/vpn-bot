import { ExpenseCategory } from '@prisma/client';
import { prisma } from '../../prisma';
import { Decimal } from '@prisma/client/runtime/client';

export class ExpensesRepository {
	async create(category: ExpenseCategory, amount: Decimal, description: string = '') {
		await prisma.expense.create({
			data: {
				category,
				amount,
				description,
			},
		});
	}

	async list() {
		return await prisma.expense.findMany();
	}

	async sum() {
		return await prisma.expense.aggregate({
			_sum: {
				amount: true,
			},
		});
	}

	async sumNalogs() {
		return await prisma.expense.aggregate({
			where: {
				category: ExpenseCategory.Nalog,
			},
			_sum: {
				amount: true,
			},
		});
	}
	async sumServers() {
		return await prisma.expense.aggregate({
			where: {
				category: ExpenseCategory.Servers,
			},
			_sum: {
				amount: true,
			},
		});
	}

	async delete(id: string) {
		return await prisma.expense.delete({
			where: {
				id,
			},
		});
	}
}
