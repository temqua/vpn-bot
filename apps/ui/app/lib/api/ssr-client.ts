import env from '@/app/lib/env';
import { authSessionKey } from './auth';
import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

export interface IErrorBody {
	message?: string;
	statusCode?: string;
}

class SSRClient {
	async request(url: string, params: RequestInit) {
		const cookieStore = await cookies();
		const record = cookieStore.get(authSessionKey);
		if (!record) {
			throw new Error('There is no user session cookie set');
		}
		const token = record.value;
		const apiUrl = env.NEXT_PUBLIC_API_URL;
		console.time(`${params.method} Request to ${apiUrl}${url}`);
		const response = await fetch(`${apiUrl}${url}`, {
			...params,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
				...(params?.headers ? { ...params.headers } : {}),
			},
		}).catch(error2 => {
			throw new Error(`Internal server error. Server-side request error: ` + error2.message);
		});
		console.timeEnd(`${params.method} Request to ${apiUrl}${url}`);
		if (response.status === 401) {
			redirect('/login', RedirectType.replace);
		}
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
		return response;
	}
}
export default new SSRClient();
