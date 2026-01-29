import { addDays, addMonths, subMonths } from 'date-fns';
import client from '../../client';
import env from '../../env';
import logger from '../../logger';
import { isJSONErrorResponse } from '../../utils';
import {
	PasarguardAuthResponse,
	PasarguardUserResponse,
	PasarguardDeleteResult,
	PasarguardErrorResponse,
	PasarguardUserBody,
} from './pasarguard.types';
import { basename } from 'path';

export class PasarguardService {
	private apiRoot = env.PASARGUARD_ROOT;

	async auth(): Promise<string> {
		const body = new FormData();
		body.append('username', env.PASARGUARD_USERNAME);
		body.append('password', env.PASARGUARD_PASSWORD);
		const response = await fetch(`${this.apiRoot}/api/admin/token`, {
			method: 'POST',
			body,
		});
		if (!response.ok && isJSONErrorResponse(response)) {
			const responseBody = (await response.json()) as PasarguardErrorResponse;
			const detail =
				typeof responseBody.detail === 'object' ? JSON.stringify(responseBody.detail) : responseBody.detail;
			throw new Error(detail);
		}
		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}
		const responseBody = (await response.json()) as PasarguardAuthResponse;
		return responseBody?.access_token;
	}

	async createUser(
		username: string,
		params: { expiresOn?: Date; isNew?: boolean } = {},
	): Promise<PasarguardUserResponse> {
		const { isNew = false, expiresOn } = params;
		const token = await this.auth();
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const monthAfter = addMonths(today, 1);
		const expire = isNew || !expiresOn ? monthAfter.toISOString() : addDays(expiresOn, 1).toISOString();
		const newUser: PasarguardUserBody = {
			username,
			status: 'active',
			data_limit: 0,
			expire,
			note: '',
			group_ids: [1],
			proxy_settings: {
				vless: { flow: 'xtls-rprx-vision' },
				shadowsocks: {
					'method': 'chacha20-ietf-poly1305',
				},
			},
			next_plan: null,
		};
		const response = await client.post(`${this.apiRoot}/api/user`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(newUser),
		});

		if (!response.ok && isJSONErrorResponse(response)) {
			const responseBody = (await response.json()) as PasarguardErrorResponse;
			const detail =
				typeof responseBody.detail === 'object' ? JSON.stringify(responseBody.detail) : responseBody.detail;
			logger.error(`[${basename(__filename)}]: ${detail}`);
			return null;
		}
		if (!response.ok) {
			logger.error(`[${basename(__filename)}]: ${response.status} ${response.statusText}`);
			return null;
		}
		const result = (await response.json()) as PasarguardUserResponse;

		return result;
	}

	async updateUser(username: string, params: PasarguardUserBody): Promise<PasarguardUserResponse> {
		const token = await this.auth();
		const response = await client.put(`${this.apiRoot}/api/user/${username}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(params),
		});
		if (!response.ok && isJSONErrorResponse(response)) {
			const responseBody = (await response.json()) as PasarguardErrorResponse;
			const detail =
				typeof responseBody.detail === 'object' ? JSON.stringify(responseBody.detail) : responseBody.detail;
			logger.error(`[${basename(__filename)}]: ${detail}`);
			return null;
		}
		if (!response.ok) {
			logger.error(`[${basename(__filename)}]: ${response.status} ${response.statusText}`);
			return null;
		}
		const result = (await response.json()) as PasarguardUserResponse;

		return result;
	}

	async deleteUser(username: string): Promise<PasarguardDeleteResult> {
		const token = await this.auth();
		const response = await client.delete(`${this.apiRoot}/api/user/${username}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		if (!response.ok && isJSONErrorResponse(response)) {
			const responseBody = (await response.json()) as PasarguardErrorResponse;
			const detail =
				typeof responseBody.detail === 'object' ? JSON.stringify(responseBody.detail) : responseBody.detail;
			logger.error(`[${basename(__filename)}]: ${detail}`);
			return {
				success: false,
				error: detail,
			};
		}
		return {
			success: response.ok,
			error: null,
		};
	}
}
