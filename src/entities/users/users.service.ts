import type { Device, User } from '@prisma/client';
import { prisma } from '../../core/prisma';
import { UsersRepository } from './users.repository';

class UsersService {
	constructor(private repository: UsersRepository) {}
	async create(username: string, firstName: string, telegramId: string | null, telegramLink: string | null) {
		return await this.repository.create(username, firstName, telegramLink, telegramId);
	}

	async list(): Promise<User[]> {
		return await this.repository.list();
	}

	async delete(id: number) {
		return await this.repository.delete(id);
	}

	async addDevice(telegramId: string, device: Device) {
		const user = await prisma.user.findFirstOrThrow({
			where: {
				telegramId,
			},
		});
		await prisma.userDevice.create({
			data: {
				userId: user.id,
				device,
			},
		});
	}
}

export const usersService = new UsersService(new UsersRepository());
