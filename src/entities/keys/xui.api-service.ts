import https from 'https';
import type { Message } from 'node-telegram-bot-api';
import type { IKeysService } from '../../core/contracts';
import env from '../../env';
import logger from '../../core/logger';
import bot from '../../core/bot';

type XUINewClientSettings = {
	id: string;
	flow: string;
	email: string;
	limitIp: number;
	totalGB: number;
	expiryTime: number;
	enable: boolean;
	tgId: string;
	subId: string;
	reset: number;
};

type XUINewClient = {
	id: number;
	settings: string;
};

const httpsAgent = new https.Agent({
	rejectUnauthorized: false, // Ignore self-signed certificates
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export class XUIApiService implements IKeysService {
	async create(message: Message, username: string) {
		await this.login();
	}
	async delete(message: Message, username: string) {
		await this.login();
	}
	async getAll(message: Message) {
		await this.login();
		const response = await fetch(`${env.XUI_API_ROOT}/panel/api/inbounds/list`, {
			dispatcher: httpsAgent,
		});
		if (!response.ok) {
			await bot.sendMessage(
				message.chat.id,
				`Error while fetching X-UI users: ${response.status} ${response.statusText}`,
			);
			logger.error(`X-UI users list fetching finished with error: ${response.status} ${response.statusText}`);
			return null;
		}
		return await response.json();
	}

	private async login() {
		const creds = JSON.stringify({
			username: env.XUI_USERNAME,
			password: env.XUI_PASSWORD,
		});
		const response = await fetch(`${env.XUI_API_ROOT}/login`, {
			body: creds,
			dispatcher: httpsAgent,
		});
	}
}
