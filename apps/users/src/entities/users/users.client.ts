import client from '../../api-client';
import { VPNUser } from './users.repository';

export class UsersClient {
	async list(): Promise<VPNUser[]> {
		const result = await client.get('/users');
		return result as VPNUser[];
	}

	async getById(id: number): Promise<VPNUser> {
		const result = await client.get(`/users/${id}`);
		return result as VPNUser;
	}


}
