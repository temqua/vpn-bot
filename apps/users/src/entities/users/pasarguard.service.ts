import client from '../../client';
import env from '../../env';
import logger from '../../logger';
import { isJSONErrorResponse } from '../../utils';

type PasarguardAuthResponse = {
	access_token: string;
	token_type: string;
};

type PasarguardErrorResponse = {
	detail:
		| string
		| {
				[key: string]: string;
		  };
};

type PasarguardCreateResponse = {
	proxy_settings: {
		vmess: {
			id: string;
		};
		vless: {
			id: string;
			flow: string;
		};
		trojan: {
			password: string;
		};
		shadowsocks: {
			password: string;
			method: string;
		};
	};
	expire: unknown | null;
	data_limit: number;
	data_limit_reset_strategy: string;
	note: string;
	on_hold_expire_duration: unknown | null;
	on_hold_timeout: unknown | null;
	group_ids: number[];
	auto_delete_in_days: unknown | null;
	next_plan: unknown | null;
	id: number;
	username: string;
	status: string;
	used_traffic: number;
	lifetime_used_traffic: number;
	created_at: string;
	edit_at: unknown | null;
	online_at: unknown | null;
	subscription_url: string;
	admin: {
		username: string;
	};
};

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

	async createUser(username: string): Promise<PasarguardCreateResponse> {
		const token = await this.auth();
		const newUser = {
			username,
			status: 'active',
			data_limit: 0,
			expire: 0,
			note: '',
			group_ids: [1],
			proxy_settings: {
				vless: {},
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
			logger.error(detail);
		}
		if (!response.ok) {
			logger.error(`${response.status} ${response.statusText}`);
		}
		const result = (await response.json()) as PasarguardCreateResponse;

		return result;
	}

	async deleteUser(username: string) {
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
			logger.error(detail);
			return false;
		}
		return response.ok;
	}
}
