import type { User } from '@prisma/client';
import { prisma } from '../../core/prisma';

export class UsersRepository {
	async create(
		username: string,
		firstName: string,
		telegramId: string | null,
		telegramLink: string | null,
		lastName: string | null,
	) {
		return await prisma.user.create({
			data: {
				username,
				firstName,
				telegramLink,
				telegramId,
				lastName,
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

	async list(): Promise<User[]> {
		return await prisma.user.findMany();
	}

	async delete(id: number) {
		await prisma.user.delete({
			where: {
				id,
			},
		});
	}
}
