import type { Bank, Device, Payment, User, VPNProtocol } from '@prisma/client';
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
		bank: Bank,
	): Promise<User> {
		return await prisma.user.create({
			data: {
				username,
				firstName,
				telegramLink,
				telegramId,
				lastName,
				devices,
				protocols,
				bank,
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

	async findByUsername(username: string): Promise<VPNUser[]> {
		return await prisma.user.findMany({
			where: {
				username: {
					mode: 'insensitive',
					contains: username,
				},
			},
			include: {
				payer: true,
				payments: true,
				dependants: true,
			},
		});
	}

	async getByUsername(username: string): Promise<VPNUser> {
		return await prisma.user.findUnique({
			where: {
				username,
			},
			include: {
				payer: true,
				payments: true,
				dependants: true,
			},
		});
	}

	async findByFirstName(firstName: string): Promise<VPNUser[]> {
		return await prisma.user.findMany({
			where: {
				firstName: {
					mode: 'insensitive',
					contains: firstName,
				},
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

	async payersList(userId: number): Promise<User[]> {
		return await prisma.user.findMany({
			where: {
				payerId: null,
				id: {
					not: userId,
				},
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

	async getUnpaidUsers() {
		return await prisma.user.findMany({
			where: {
				free: false,
				active: true,
				payments: {
					none: {
						expiresOn: {
							gt: new Date(),
						},
					},
				},
			},
			include: {
				payments: {
					orderBy: {
						paymentDate: 'desc',
					},
				},
			},
		});
	}
}
