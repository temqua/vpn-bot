import type { Device, Payment, User, VPNProtocol } from '@prisma/client';
import { subMonths, subWeeks } from 'date-fns';
import type { Bank } from '../../enums';
import { prisma } from '../../prisma';

export type VPNUser = User & {
	payer: User | null;
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
				bank,
			},
		});
	}

	async getById(id: number): Promise<VPNUser | null> {
		return await prisma.user.findUnique({
			where: {
				id,
			},
			include: {
				payer: true,
				payments: {
					orderBy: {
						paymentDate: 'desc',
					},
				},
				dependants: true,
			},
		});
	}

	async getByTelegramId(telegramId: string): Promise<VPNUser | null> {
		return await prisma.user.findUnique({
			where: {
				telegramId,
			},
			include: {
				payer: true,
				payments: {
					orderBy: {
						paymentDate: 'desc',
					},
				},
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
				payments: {
					orderBy: {
						paymentDate: 'desc',
					},
				},
				dependants: true,
			},
		});
	}

	async getByUsername(username: string): Promise<VPNUser | null> {
		return await prisma.user.findUnique({
			where: {
				username,
			},
			include: {
				payer: true,
				payments: {
					orderBy: {
						paymentDate: 'desc',
					},
				},
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
				payments: {
					orderBy: {
						paymentDate: 'desc',
					},
				},
				dependants: true,
			},
		});
	}

	async update(
		id: number,
		data: {
			[key: string]: string[] | number | string | boolean;
		},
	) {
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
				payments: {
					orderBy: {
						paymentDate: 'desc',
					},
				},
				dependants: true,
			},
		});
	}

	async payersList(userId: number): Promise<User[]> {
		return await prisma.user.findMany({
			where: {
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
				createdAt: {
					lt: subWeeks(new Date(), 4),
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

	async isTelegramUserUnpaid(telegramId: string) {
		return await prisma.user.findFirst({
			where: {
				payments: {
					none: {
						expiresOn: {
							gt: new Date(),
						},
					},
				},
				createdAt: {
					lt: subMonths(new Date(), 1),
				},
				telegramId,
			},
		});
	}

	async isUserUnpaid(id: number) {
		return await prisma.user.findFirst({
			where: {
				payments: {
					none: {
						expiresOn: {
							gt: new Date(),
						},
					},
				},
				createdAt: {
					lt: subMonths(new Date(), 1),
				},
				id,
				active: true,
				free: false,
			},
		});
	}

	async isUserPaid(id: number) {
		return await prisma.user.findFirst({
			where: {
				id,
				active: true,
				OR: [
					{
						createdAt: {
							lt: subMonths(new Date(), 1),
						},
						payments: {
							some: {
								expiresOn: {
									gt: new Date(),
								},
							},
						},
					},
					{
						createdAt: {
							gt: subMonths(new Date(), 1),
						},
					},
					{
						free: true,
					},
				],
			},
		});
	}

	async getTrialUsers() {
		return await prisma.user.findMany({
			where: {
				free: false,
				active: true,
				createdAt: {
					gt: subWeeks(new Date(), 3),
				},
			},
		});
	}

	async createUserServer(userId: number, serverId: number, protocol: VPNProtocol, username: string) {
		return await prisma.serversUsers.create({
			data: {
				serverId,
				userId,
				protocol,
				username,
			},
			include: {
				server: {},
				user: {},
			},
		});
	}

	async deleteUserServer(id: number) {
		return await prisma.serversUsers.delete({
			where: {
				id,
			},
		});
	}

	async getUserServer(userId: number, serverId: number, protocol: VPNProtocol) {
		return await prisma.serversUsers.findFirst({
			where: {
				userId,
				serverId,
				protocol,
			},
			include: {
				server: {},
				user: {},
			},
		});
	}

	async listUserServers(userId: number) {
		return await prisma.serversUsers.findMany({
			where: {
				userId,
			},
			include: {
				server: {},
				user: {},
			},
		});
	}
}
