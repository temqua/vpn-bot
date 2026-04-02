import { UserServerDTO } from './users.types';
import client from '../../api-client';
import { VPNProtocol } from '@prisma/client';

export class UsersServersClient {
	async getById(id: number): Promise<UserServerDTO> {
		const result = await client.get(`/users-servers/${id}`);
		return <UserServerDTO>result;
	}

	async create(userId: number, serverId: number, protocol: VPNProtocol, username: string) {
		const result = await client.post(`/users-servers`, {
			body: JSON.stringify({
				userId,
				serverId,
				protocol,
				username,
			}),
		});
		return <UserServerDTO>result;
	}

	async delete(id: number) {
		const result = await client.delete(`/users-servers/${id}`);
		return <UserServerDTO>result;
	}
}
