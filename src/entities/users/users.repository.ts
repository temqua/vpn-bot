import type { Device, User, VPNProtocol } from '@prisma/client';
import { prisma } from '../../core/prisma';

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

	async getById(id: number): Promise<User> {
		return await prisma.user.findUnique({
			where: {
				id,
			},
		});
	}

	async update(id: number, data) {
		return await prisma.user.update({
			where: {
				id,
			},
			data,
		});
	}

	async list(): Promise<User[]> {
		return await prisma.user.findMany();
	}

	async delete(id: number) {
		return await prisma.user.delete({
			where: {
				id,
			},
		});
	}
}
