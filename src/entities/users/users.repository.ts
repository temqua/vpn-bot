import type { Device, Payment, User, VPNProtocol } from '@prisma/client';
import { prisma } from '../../core/prisma';

export type VPNUser = User & {
	payer: User;
	payments: Payment[];
	dependants: User[];
};

export class UsersRepository {
	async create(
		username: string,
		firstName: string,
		telegramId: string | null,
		telegramLink: string | null,
		lastName: string | null,
		devices: Device[],
		protocols: VPNProtocol[],
	) {
		return await prisma.user.create({
			data: {
				username,
				firstName,
				telegramLink,
				telegramId,
				lastName,
				devices,
				protocols,
			},
		});
	}

	async getById(id: number): Promise<VPNUser> {
		return await prisma.user.findUnique({
			where: {
				id,
			},
			include: {
				payer: true,
				payments: true,
				dependants: true,
			},
		});
	}

	async getByTelegramId(telegramId: string): Promise<VPNUser> {
		return await prisma.user.findUnique({
			where: {
				telegramId,
			},
			include: {
				payer: true,
				payments: true,
				dependants: true,
			},
		});
	}

	async update(id: number, data) {
		return await prisma.user.update({
			where: {
				id,
			},
			include: {
				payer: true,
				payments: true,
				dependants: true,
			},
			data,
		});
	}

	async list(): Promise<VPNUser[]> {
		return await prisma.user.findMany({
			orderBy: {
				firstName: 'asc',
			},
			include: {
				payer: true,
				payments: true,
				dependants: true,
			},
		});
	}

	async payersList(): Promise<User[]> {
		return await prisma.user.findMany({
			where: {
				payerId: null,
			},
			orderBy: {
				firstName: 'asc',
			},
		});
	}

	async delete(id: number) {
		return await prisma.user.delete({
			where: {
				id,
			},
		});
	}
}
