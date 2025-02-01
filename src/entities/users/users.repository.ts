import type { User, UserDevice, UserProtocol } from '@prisma/client';
import { prisma } from '../../core/prisma';

export type FullUserInfo = User & {
	devices: UserDevice[];
	protocols: UserProtocol[];
};

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

	async getById(id: number): Promise<FullUserInfo> {
		return await prisma.user.findUnique({
			where: {
				id,
			},
			include: {
				devices: true,
				protocols: true,
			},
		});
	}

	async update(id: number, data) {
		return await prisma.user.update({
			where: {
				id,
			},
			data,
			include: {
				devices: true,
				protocols: true,
			},
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
