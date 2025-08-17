// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import https from 'https';
const httpsAgent = new https.Agent({
	rejectUnauthorized: false, // Ignore self-signed certificates
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
