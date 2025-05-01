import https from 'https';
import bot from '../../core/bot';
import logger from '../../core/logger';
import env from '../../env';
import type { XOnlineClientsResponse, XUIInboundsResponse, XUILoginResponse } from './xui.types';

const httpsAgent = new https.Agent({
	rejectUnauthorized: false, // Ignore self-signed certificates
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export class XUIApiService {
	async create(chatId: number, username: string) {
		await this.login(chatId);
	}
	async delete(chatId: number, username: string) {
		await this.login(chatId);
	}
	async getAll(chatId: number): Promise<XUIInboundsResponse | null> {
		const loginResponse = await this.login(chatId);
		const loginResult: XUILoginResponse = await loginResponse.json();

		if (!loginResult.success) {
			await bot.sendMessage(chatId, `Auth error 3X-UI. ${loginResult.msg}`);
			logger.error(`Auth error 3X-UI. ${loginResult.msg}`);
			return null;
		}
		const cookies = loginResponse.headers.getSetCookie();
		const parsedCookies = cookies.map(cookie => {
			return cookie.split(';')[0].trim(); // берем только key=value (игнорируем параметры вроде Expires, HttpOnly)
		});
		const response = await fetch(`${env.XUI_API_ROOT}/panel/api/inbounds/list`, {
			method: 'GET',
			headers: {
				'Cookie': parsedCookies[1],
			},
			dispatcher: httpsAgent,
		});
		if (!response.ok) {
			await bot.sendMessage(chatId, `Error while fetching X-UI users: ${response.status} ${response.statusText}`);
			logger.error(`X-UI users list fetching finished with error: ${response.status} ${response.statusText}`);
			return null;
		}

		return (await response.json()) as XUIInboundsResponse;
	}

	async getOnline(chatId: number): Promise<XOnlineClientsResponse> {
		const loginResponse = await this.login(chatId);
		const loginResult: XUILoginResponse = await loginResponse.json();

		if (!loginResult.success) {
			await bot.sendMessage(chatId, `Auth error 3X-UI. ${loginResult.msg}`);
			logger.error(`Auth error 3X-UI. ${loginResult.msg}`);
			return null;
		}
		const cookies = loginResponse.headers.getSetCookie();
		const parsedCookies = cookies.map(cookie => {
			return cookie.split(';')[0].trim(); // берем только key=value (игнорируем параметры вроде Expires, HttpOnly)
		});
		const response = await fetch(`${env.XUI_API_ROOT}/panel/api/inbounds/onlines`, {
			method: 'POST',
			headers: {
				'Cookie': parsedCookies[1],
			},
			dispatcher: httpsAgent,
		});
		if (!response.ok) {
			await bot.sendMessage(
				chatId,
				`Error while fetching online X-UI users: ${response.status} ${response.statusText}`,
			);
			logger.error(
				`X-UI online users list fetching finished with error: ${response.status} ${response.statusText}`,
			);
			return null;
		}

		return (await response.json()) as XOnlineClientsResponse;
	}

	private async login(chatId: number): Promise<Response> {
		const body = new URLSearchParams({
			username: env.XUI_USERNAME,
			password: env.XUI_PASSWORD,
		});
		const response = await fetch(`${env.XUI_API_ROOT}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body,
			dispatcher: httpsAgent,
		});
		if (!response.ok) {
			await bot.sendMessage(chatId, `Auth error to 3X-UI: ${response.status} ${response.statusText}`);
			logger.error(`Auth error to 3X-UI: ${response.status} ${response.statusText}`);
			return null;
		}
		return response;
	}
}
