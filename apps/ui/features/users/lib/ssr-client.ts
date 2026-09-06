import ssrClient from '@/app/lib/api/ssr-client';
import { IVPNUser, IVPNUserDTO, IVPNUserListDTO } from '@/app/lib/api/users/definitions';
import { IListParams, ListResponse } from '@/app/lib/definitions.global';

export interface IUserListParams extends IListParams {
	select?: (keyof IVPNUser)[];
	id?: string;
	username?: string;
	firstName?: string | null;
	lastName?: string | null;
	telegramId?: string | null;
	price?: string;
	free?: string;
	active?: string;
	orderBy?: string;
	orderDirection?: string;
}
export class UsersSSRClient {
	async getAll(listParams?: IUserListParams): Promise<ListResponse<IVPNUserListDTO>> {
		const params = new URLSearchParams(listParams as Record<string, string>);
		return await ssrClient.get(`/api/v1/users?${params}`);
	}

	async getById(id: string): Promise<IVPNUserDTO> {
		return await ssrClient.get(`/api/v1/users/${id}`);
	}

	async getServers(id: string) {
		return await ssrClient.get(`/api/v1/users/${id}/servers`);
	}
}
export const usersSSRClient = new UsersSSRClient();
