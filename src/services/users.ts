import type { Device } from '@prisma/client';
import { prisma } from './prisma';

class UsersService {
	async create(username: string, telegramId: string) {
		await prisma.user.create({
			data: {
				username,
				telegramId,
			},
		});
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

export const usersService = new UsersService();
