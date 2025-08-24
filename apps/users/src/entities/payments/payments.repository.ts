import type { Payment, Plan, User } from '@prisma/client';
import { endOfDay, startOfDay } from 'date-fns';
import { prisma } from '../../prisma';

export type UserPaymentDto = {
	amount: number;
	monthsCount: number;
	expiresOn: Date;
	plan?: Plan;
	parentPaymentId?: string;
};

export type UserPayment = {
	user: User;
} & Payment;

export class PaymentsRepository {
	async create(userId: number, paymentParams: UserPaymentDto): Promise<Payment> {
		return await prisma.payment.create({
			data: {
				userId,
				amount: paymentParams.amount,
				monthsCount: paymentParams.monthsCount,
				expiresOn: paymentParams.expiresOn,
				planId: paymentParams.plan?.id ?? null,
				parentPaymentId: paymentParams.parentPaymentId ?? null,
				currency: 'RUB',
			},
		});
	}

	async getLastPayment(userId: number): Promise<Payment | null> {
		return await prisma.payment.findFirst({
			where: {
				userId,
			},
			orderBy: {
				paymentDate: 'desc',
			},
		});
	}

	async getAllByUserId(userId: number): Promise<Payment[]> {
		return await prisma.payment.findMany({
			where: {
				userId,
			},
		});
	}

	async getById(id: string): Promise<Payment | null> {
		return await prisma.payment.findUnique({
			where: {
				id,
			},
		});
	}

	async getAll(): Promise<Payment[]> {
		return await prisma.payment.findMany();
	}

	async getAllForSheet() {
		return await prisma.payment.findMany({
			orderBy: {
				paymentDate: 'desc',
			},
			include: {
				user: {},
				plan: {},
			},
		});
	}

	async getByDate(date: Date): Promise<Payment[]> {
		return await prisma.payment.findMany({
			where: {
				paymentDate: {
					gte: startOfDay(date),
					lte: endOfDay(date),
				},
			},
		});
	}

	async getByDateRange(from: Date, to: Date): Promise<Payment[]> {
		return await prisma.payment.findMany({
			where: {
				paymentDate: {
					gte: startOfDay(from),
					lte: endOfDay(to),
				},
			},
		});
	}

	async sum() {
		return await prisma.payment.aggregate({
			_sum: {
				amount: true,
			},
		});
	}

	async delete(id: string | undefined) {
		return await prisma.payment.delete({
			where: {
				id,
			},
		});
	}
}
