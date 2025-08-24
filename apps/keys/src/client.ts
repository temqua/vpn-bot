// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { fetch, Agent } from 'undici';

const httpsAgent = new Agent({
	connect: {
		rejectUnauthorized: false,
	},
});

export default {
	async get(url: string, params?: RequestInit) {
		return await fetch(url, {
			method: 'GET',
			dispatcher: httpsAgent,
			headers: params?.headers ? { ...params.headers } : {},
		});
	},
	async post(url: string, params?: RequestInit) {
		return await fetch(url, {
			method: 'POST',
			dispatcher: httpsAgent,
			body: params.body,
			headers: {
				'Content-Type': 'application/json',
				...(params?.headers ? { ...params.headers } : {}),
			},
		});
	},
	async put(url: string, params?: RequestInit) {
		return await fetch(url, {
			method: 'PUT',
			dispatcher: httpsAgent,
			body: params.body,
			headers: {
				'Content-Type': 'application/json',
				...(params?.headers ? { ...params.headers } : {}),
			},
		});
	},
	async delete(url: string, params?: RequestInit) {
		return await fetch(url, {
			method: 'DELETE',
			dispatcher: httpsAgent,
			headers: params?.headers ? { ...params.headers } : {},
		});
	},
};
