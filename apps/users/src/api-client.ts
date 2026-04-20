import env from './env';

export interface IErrorBody {
	message?: string;
	statusCode?: string;
}

class ApiClient {
	async request(url: string, params: RequestInit) {
		console.time(`${params.method} Request to ${env.API_URL}${url}`);
		const response = await fetch(`${env.API_URL}${url}`, {
			...params,
			headers: {
				'Content-Type': 'application/json',
				'X-Source': 'bot',
				'Authorization': `Bearer ${env.API_TOKEN}`,
				...(params?.headers ? { ...params.headers } : {}),
			},
		});
		console.timeEnd(`${params.method} Request to ${env.API_URL}${url}`);
		const isJson = response.headers.get('Content-Type')?.includes('application/json');
		if (!response.ok && response.body && isJson) {
			const errorBody: IErrorBody = await response.json();
			if (!errorBody.message) {
				throw new Error(JSON.stringify(errorBody));
			}
			throw new Error(errorBody.message);
		}
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		return response;
	}
	async get(url: string, params?: RequestInit) {
		const response = await this.request(url, {
			method: 'GET',
			...params,
		});
		return await response.json();
	}

	async post(url: string, params?: RequestInit) {
		const response = await this.request(url, {
			method: 'POST',
			...params,
		});
		return await response.json();
	}

	async patch(url: string, params?: RequestInit) {
		const response = await this.request(url, {
			method: 'PATCH',
			...params,
		});
		return await response.json();
	}

	async put(url: string, params?: RequestInit) {
		const response = await this.request(url, {
			method: 'PUT',
			...params,
		});
		return await response.json();
	}

	async delete(url: string, params?: RequestInit) {
		const response = await this.request(url, {
			method: 'DELETE',
			...params,
		});
		return await response.json();
	}
}
export default new ApiClient();
