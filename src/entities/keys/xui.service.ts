import { basename } from 'path';
import bot from '../../core/bot';
import logger from '../../core/logger';
import type { XUIApiService } from './xui.api-service';

export class XUIService {
	constructor(private service: XUIApiService) {}

	async getAll(chatId: number) {
		const result = await this.service.getAll(chatId);
		if (!result) {
			return;
		}
		if (!result.success) {
			await bot.sendMessage(chatId, `Error while fetching X-UI inbounds: ${result.msg}`);
			logger.error(`Error while fetching X-UI inbounds: ${result.msg}`);
		}
		for (const inbound of result.obj) {
			await bot.sendMessage(
				chatId,
				`Inbound params:
id: ${inbound.id}
enabled: ${inbound.enable}
protocol: ${inbound.protocol}
                `,
			);
			for (const client of inbound.clientStats) {
				await bot.sendMessage(
					chatId,
					`
id: ${client.id}
enabled: ${client.enable}
email: ${client.email}                    
                    `,
				);
			}
		}
	}

	async getOnline(chatId: number) {
		const result = await this.service.getOnline(chatId);
		if (!result) {
			return;
		}
		if (!result.success) {
			await bot.sendMessage(chatId, `Error while fetching online X-UI users: ${result.msg}`);
			logger.error(`Error while fetching online X-UI users: ${result.msg}`);
		}
		await bot.sendMessage(chatId, `Online users: ${result.obj.join(', ')}`);
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
}
