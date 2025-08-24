export default {
	async get(url: string, params?: RequestInit) {
		return await fetch(url, {
			method: 'GET',
			headers: params?.headers ? { ...params.headers } : {},
		});
	},
	async post(url: string, params?: RequestInit) {
		return await fetch(url, {
			method: 'POST',
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
			headers: params?.headers ? { ...params.headers } : {},
		});
	},
};
