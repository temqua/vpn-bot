import { VpnServer } from '@prisma/client';
import client from '../../api-client';
import { CreateServerDto } from './servers.types';

export class ServersClient {
	async getAll(): Promise<VpnServer[]> {
		const params = new URLSearchParams();
		// params.append('price', price.toString());
		const result = await client.get(`/servers?${params}`);
		return result as VpnServer[];
	}

	async getById(id: number): Promise<VpnServer | null> {
		const result = await client.get(`/servers/${id}`);
		return result as VpnServer;
	}

	async create(dto: CreateServerDto): Promise<VpnServer | null> {
		const result = await client.post(`/servers`, {
			body: JSON.stringify(dto),
		});
		return result as VpnServer | null;
	}

	async update(id: number, dto: Partial<CreateServerDto>): Promise<VpnServer> {
		const result = await client.patch(`/servers/${id}`, {
			body: JSON.stringify(dto),
		});
		return result as VpnServer;
	}

	async delete(id: number) {
		const result = await client.delete(`/servers/${id}`);
		return result;
	}
}
