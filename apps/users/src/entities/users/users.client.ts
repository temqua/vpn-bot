import { Payment } from '@prisma/client';
import client from '../../api-client';
import { VPNUser } from './users.repository';
import { CreateUserDto, SearchUserDto } from './users.types';
import logger from '../../logger';

export class UsersClient {
	async list(dto?: SearchUserDto): Promise<VPNUser[]> {
		const params = new URLSearchParams();
		if (dto?.firstName) {
			params.append('first_name', dto.firstName);
		}

		if (dto?.username) {
			params.append('username', dto.username);
		}
		const result = await client.get(`/users?${params}`);
		return result as VPNUser[];
	}

	async getByTelegramId(telegramId: string): Promise<VPNUser> {
		const params = new URLSearchParams();
		params.append('telegram_id', telegramId.toString());
		const result = await client.get(`/users?${params}`);
		return result as VPNUser;
	}

	async getById(id: number): Promise<VPNUser> {
		const result = await client.get(`/users/${id}`);
		return result as VPNUser;
	}

	async getByUsername(username: string): Promise<VPNUser> {
		const params = new URLSearchParams();
		params.append('username', username);
		const result = await client.get(`/users?${params}`);
		return result as VPNUser;
	}

	async getUnpaid(): Promise<VPNUser[]> {
		const result = await client.get('/users/unpaid');
		return result as VPNUser[];
	}

	async getTrial(): Promise<VPNUser[]> {
		const result = await client.get('/users/trial');
		return result as VPNUser[];
	}

	async getLastPayment(id: number): Promise<Payment | null> {
		let result = null;
		try {
			result = await client.get(`/users/${id}/payments/last`);
		} catch (err) {
			logger.error(err);
		}
		return result as Payment | null;
	}

	async create(dto: CreateUserDto): Promise<VPNUser | null> {
		const result = await client.post(`/users`, {
			body: JSON.stringify(dto),
		});
		return result as VPNUser | null;
	}

	async update(id: number, dto: Partial<CreateUserDto>): Promise<VPNUser> {
		const result = await client.patch(`/users/${id}`, {
			body: JSON.stringify(dto),
		});
		return result as VPNUser;
	}

	async delete(id: number) {
		const result = await client.delete(`/users/${id}`);
		return result;
	}
}
