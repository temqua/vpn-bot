import type { Payment, Plan, User } from '@prisma/client';
import { prisma } from '../../core/prisma';

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

	async getLastPayment(userId: number): Promise<Payment> {
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

	async getById(id: string): Promise<Payment> {
		return await prisma.payment.findUnique({
			where: {
				id,
			},
		});
	}
}
