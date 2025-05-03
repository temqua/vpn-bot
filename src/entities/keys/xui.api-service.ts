import https from 'https';
import bot from '../../core/bot';
import logger from '../../core/logger';
import env from '../../env';
import type {
	XOnlineClientsResponse,
	XUIBaseResponse,
	XUIInboundsResponse,
	XUILoginResponse,
	XUINewClient,
	XClientSettings,
} from './xui.types';
import { randomUUID } from 'crypto';
const httpsAgent = new https.Agent({
	rejectUnauthorized: false, // Ignore self-signed certificates
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export class XUIApiService {
	async create(chatId: number, username: string, telegramId: number, inboundId = 1): Promise<string | null> {
		const loginResponse = await this.login(chatId);
		const loginResult: XUILoginResponse = await loginResponse.json();
		if (!loginResult.success) {
			await bot.sendMessage(chatId, `Auth error 3X-UI. ${loginResult.msg}`);
			logger.error(`Auth error 3X-UI. ${loginResult.msg}`);
			return null;
		}
		const id = randomUUID();
		const newClient: XClientSettings = {
			id: id,
			flow: 'xtls-rprx-vision',
			email: username,
			limitIp: 0,
			totalGB: 0,
			expiryTime: 0,
			enable: true,
			tgId: telegramId ?? '',
			reset: 0,
		};
		const body: XUINewClient = {
			id: inboundId ?? 1,
			settings: JSON.stringify({
				clients: [newClient],
			}),
		};
		const response = await fetch(`${env.XUI_API_ROOT}/panel/api/inbounds/addClient`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Cookie': this.getCookie(loginResponse.headers),
			},
			body: JSON.stringify(body),
			dispatcher: httpsAgent,
		});
		if (!response.ok) {
			await bot.sendMessage(
				chatId,
				`Error while creating X-UI user ${username}: ${response.status} ${response.statusText}`,
			);
			logger.error(`Error while creating X-UI user ${username}: ${response.status} ${response.statusText}`);
			return null;
		}
		const result: XUIBaseResponse = await response.json();
		if (result) {
			await bot.sendMessage(chatId, result.msg);
			return id;
		}
		return null;
	}
	async delete(chatId: number, uuid: string, inboundId = 1) {
		const loginResponse = await this.login(chatId);
		const loginResult: XUILoginResponse = await loginResponse.json();
		if (!loginResult.success) {
			await bot.sendMessage(chatId, `Auth error 3X-UI. ${loginResult.msg}`);
			logger.error(`Auth error 3X-UI. ${loginResult.msg}`);
			return null;
		}
		const response = await fetch(`${env.XUI_API_ROOT}/panel/api/inbounds/${inboundId}/delClient/${uuid}`, {
			method: 'POST',
			headers: {
				'Cookie': this.getCookie(loginResponse.headers),
			},
			dispatcher: httpsAgent,
		});
		if (!response.ok) {
			await bot.sendMessage(
				chatId,
				`Error while deleting X-UI user ${uuid} for inbound ${inboundId}: ${response.status} ${response.statusText}`,
			);
			logger.error(
				`Error while deleting X-UI user ${uuid} for inbound ${inboundId}: ${response.status} ${response.statusText}`,
			);
			return null;
		}
		const result: XUIBaseResponse = await response.json();
		if (result) {
			await bot.sendMessage(chatId, result.msg);
		}
	}
	async getAll(chatId: number): Promise<XUIInboundsResponse | null> {
		const loginResponse = await this.login(chatId);
		const loginResult: XUILoginResponse = await loginResponse.json();

		if (!loginResult.success) {
			await bot.sendMessage(chatId, `Auth error 3X-UI. ${loginResult.msg}`);
			logger.error(`Auth error 3X-UI. ${loginResult.msg}`);
			return null;
		}
		const response = await fetch(`${env.XUI_API_ROOT}/panel/api/inbounds/list`, {
			method: 'GET',
			headers: {
				'Cookie': this.getCookie(loginResponse.headers),
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
		const response = await fetch(`${env.XUI_API_ROOT}/panel/api/inbounds/onlines`, {
			method: 'POST',
			headers: {
				'Cookie': this.getCookie(loginResponse.headers),
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

	private getCookie(headers: Headers): string {
		const cookies = headers.getSetCookie();
		const parsedCookies = cookies.map(cookie => {
			return cookie.split(';')[0].trim(); // берем только key=value (игнорируем параметры вроде Expires, HttpOnly)
		});
		return parsedCookies[1];
	}
}
