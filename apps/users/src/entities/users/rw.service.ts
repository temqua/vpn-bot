import { addDays, addMonths } from 'date-fns';
import client from '../../client';
import env from '../../env';
import { isJSONErrorResponse } from '../../utils';
import {
	IRWClientErrorResponse,
	IRWCreateUserResponse,
	IRWDeleteUserResponse,
	IRWNewUserDTO,
	IRWServerErrorResponse,
	IRWUpdateUserDTO,
} from './rw.types';
import logger from '../../logger';

export class RemnawaveService {
	private apiRoot = env.RW_API_ROOT;

	async createUser(username: string, params: { expiresAt?: Date | null | undefined; isNew?: boolean } = {}) {
		const { isNew = false, expiresAt } = params;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const monthAfter = addMonths(today, 1);
		const expire = isNew || !expiresAt ? monthAfter.toISOString() : addDays(expiresAt, 1).toISOString();
		const newUser: IRWNewUserDTO = {
			username,
			expireAt: expire,
		};
		const response = await client.post(`${this.apiRoot}/api/users`, {
			headers: {
				Authorization: `Bearer ${env.RW_TOKEN}`,
			},
			body: JSON.stringify(newUser),
		});
		if (!response.ok && isJSONErrorResponse(response)) {
			const responseBody = <IRWServerErrorResponse | IRWClientErrorResponse>await response.json();
			logger.error(`Error while requesting remnawave: ${responseBody.message}`);
		}
		if (!response.ok) {
			logger.error(`Error while requesting remnawave: ${response.status} ${response.statusText}`);
		}
		const result = (await response.json()) as IRWCreateUserResponse;

		return result;
	}

	async updateUser(params: IRWUpdateUserDTO) {
		const response = await client.patch(`${this.apiRoot}/api/users`, {
			headers: {
				Authorization: `Bearer ${env.RW_TOKEN}`,
			},
			body: JSON.stringify(params),
		});
		if (!response.ok && isJSONErrorResponse(response)) {
			const responseBody = <IRWServerErrorResponse | IRWClientErrorResponse>await response.json();
			throw new Error(`Error while requesting remnawave: ${responseBody.message}`);
		}
		if (!response.ok) {
			throw new Error(`Error while requesting remnawave: ${response.status} ${response.statusText}`);
		}
		const result = (await response.json()) as IRWCreateUserResponse;

		return result;
	}

	async deleteUser(uuid: string) {
		const response = await client.delete(`${this.apiRoot}/api/users/${uuid}`, {
			headers: {
				Authorization: `Bearer ${env.RW_TOKEN}`,
			},
		});
		if (!response.ok && isJSONErrorResponse(response)) {
			const responseBody = <IRWServerErrorResponse | IRWClientErrorResponse>await response.json();
			throw new Error(`Error while requesting remnawave: ${responseBody.message}`);
		}
		const result = (await response.json()) as IRWDeleteUserResponse;
		return result?.response.isDeleted;
	}
}
