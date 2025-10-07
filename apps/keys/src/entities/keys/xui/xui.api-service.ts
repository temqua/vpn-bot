import { randomUUID } from 'crypto';
import bot from '../../../bot';
import client from '../../../client';
import logger from '../../../logger';
import env from '../../../env';
import type {
	XClientSettings,
	XOnlineClientsResponse,
	XUIBaseResponse,
	XUIInboundsResponse,
	XUILoginResponse,
	XUINewClient,
} from './xui.types';

export class XUIApiService {
	async create(chatId: number, username: string, telegramId: number, inboundId = 1): Promise<string | null> {
		const loginResponse = await this.login(chatId);
		if (!loginResponse) {
			return null;
		}
		const loginResult = (await loginResponse.json()) as XUILoginResponse;
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
		const response = await client.post(`${env.XUI_API_ROOT}/panel/api/inbounds/addClient`, {
			headers: {
				'Cookie': this.getCookie(loginResponse.headers),
			},
			body: JSON.stringify(body),
		});
		if (!response.ok) {
			await bot.sendMessage(
				chatId,
				`Error while creating X-UI user ${username}: ${response.status} ${response.statusText}`,
			);
			logger.error(`Error while creating X-UI user ${username}: ${response.status} ${response.statusText}`);
			return null;
		}
		const result = (await response.json()) as XUIBaseResponse;
		if (result) {
			await bot.sendMessage(chatId, result.msg);
			return id;
		}
		return null;
	}
	async delete(chatId: number, uuid: string, inboundId = 1) {
		const loginResponse = await this.login(chatId);
		if (!loginResponse) {
			return null;
		}
		const loginResult = (await loginResponse.json()) as XUILoginResponse;
		if (!loginResult.success) {
			await bot.sendMessage(chatId, `Auth error 3X-UI. ${loginResult.msg}`);
			logger.error(`Auth error 3X-UI. ${loginResult.msg}`);
			return null;
		}
		const response = await client.post(`${env.XUI_API_ROOT}/panel/api/inbounds/${inboundId}/delClient/${uuid}`, {
			headers: {
				'Cookie': this.getCookie(loginResponse.headers),
			},
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
		const result = (await response.json()) as XUIBaseResponse;
		if (result) {
			await bot.sendMessage(chatId, result.msg);
		}
	}
	async getAll(chatId: number): Promise<XUIInboundsResponse | null> {
		const loginResponse = await this.login(chatId);
		if (!loginResponse) {
			return null;
		}
		const loginResult = (await loginResponse.json()) as XUILoginResponse;

		if (!loginResult.success) {
			await bot.sendMessage(chatId, `Auth error 3X-UI. ${loginResult.msg}`);
			logger.error(`Auth error 3X-UI. ${loginResult.msg}`);
			return null;
		}
		const response = await client.get(`${env.XUI_API_ROOT}/panel/api/inbounds/list`, {
			headers: {
				'Cookie': this.getCookie(loginResponse.headers),
			},
		});
		if (!response.ok) {
			await bot.sendMessage(chatId, `Error while fetching X-UI users: ${response.status} ${response.statusText}`);
			logger.error(`X-UI users list fetching finished with error: ${response.status} ${response.statusText}`);
			return null;
		}

		return (await response.json()) as XUIInboundsResponse;
	}

	async getOnline(chatId: number): Promise<XOnlineClientsResponse | null> {
		const loginResponse = await this.login(chatId);
		if (!loginResponse) {
			return null;
		}
		const loginResult = (await loginResponse.json()) as XUILoginResponse;

		if (!loginResult.success) {
			await bot.sendMessage(chatId, `Auth error 3X-UI. ${loginResult.msg}`);
			logger.error(`Auth error 3X-UI. ${loginResult.msg}`);
			return null;
		}
		const response = await client.post(`${env.XUI_API_ROOT}/panel/api/inbounds/onlines`, {
			headers: {
				'Cookie': this.getCookie(loginResponse.headers),
			},
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

	private async login(chatId: number): Promise<Response | null> {
		const body = new URLSearchParams({
			username: env.XUI_USERNAME,
			password: env.XUI_PASSWORD,
		});
		const response = await client.post(`${env.XUI_API_ROOT}/login`, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body,
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
		return parsedCookies[0];
	}
}
