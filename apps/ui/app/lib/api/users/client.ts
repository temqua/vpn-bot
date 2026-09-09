import { IListParams, ListResponse } from '../../definitions.global';
import apiClient from '../api-client';
import { ICreateUserDto, IUpdateUserDto, IVPNUser, IVPNUserListDTO } from './definitions';

export class UsersClient {
	async getAll(listParams?: IListParams): Promise<ListResponse<IVPNUserListDTO>> {
		const params = new URLSearchParams(listParams as Record<string, string>);
		return await apiClient.get(`/api/v1/users?${params}`);
	}

	async create(dto: ICreateUserDto): Promise<IVPNUser> {
		const result = await apiClient.post(`/api/v1/users`, {
			body: JSON.stringify(dto),
		});
		return (await result.json()) as IVPNUser;
	}

	async update(id: string, dto: IUpdateUserDto) {
		const result = await apiClient.patch(`/api/v1/users/${id}`, {
			body: JSON.stringify(dto),
		});
		return result;
	}

	async delete(id: number) {
		const result = await apiClient.delete(`/api/v1/users/${id}`);
		return result;
	}
}
export const usersClient = new UsersClient();
