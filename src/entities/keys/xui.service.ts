import type { InlineKeyboardButton, Message } from 'node-telegram-bot-api';
import { basename } from 'path';
import { setActiveStep } from '../../core';
import bot from '../../core/bot';
import { CommandScope, UserRequest, VPNKeyCommand, VPNProtocol } from '../../core/enums';
import { globalHandler } from '../../core/global.handler';
import logger from '../../core/logger';
import env from '../../env';
import type { KeysContext } from './keys.handler';
import type { XUIApiService } from './xui.api-service';
import type { SniffingSettings, StreamSettings, XInbound, XSettings } from './xui.types';

export class XUIService {
	constructor(private service: XUIApiService) {}

	private params = new Map();
	private createSteps = {
		username: false,
		telegramId: false,
		inboundId: false,
	};
	private deleteSteps = {
		user: false,
		inboundId: false,
	};
	private inbounds: XInbound[] = [];

	async create(message: Message, context: KeysContext, start = false) {
		this.log('create');
		if (start) {
			await bot.sendMessage(message.chat.id, 'Share user. For skipping just send any text', {
				reply_markup: {
					keyboard: [
						[
							{
								text: 'Share contact',
								request_user: {
									request_id: UserRequest.XUI,
								},
							},
						],
					],
					one_time_keyboard: true, // The keyboard will hide after one use
					resize_keyboard: true, // Fit the keyboard to the screen size
				},
			});
			this.setCreateStep('telegramId');
			return;
		}
		if (this.createSteps.telegramId) {
			if (message?.user_shared) {
				this.params.set('telegram_id', message.user_shared.user_id.toString());
			}
			await bot.sendMessage(message.chat.id, 'Enter new username');
			this.setCreateStep('username');
			return;
		}
		if (this.createSteps.username) {
			this.params.set('username', message.text);
			const result = await this.service.getAll(message.chat.id);
			if (!result.success) {
				await bot.sendMessage(message.chat.id, `Error while fetching X-UI inbounds: ${result.msg}`);
				logger.error(`Error while fetching X-UI inbounds: ${result.msg}`);
				this.params.set('inbound_id', 1);
			} else {
				this.inbounds = result.obj;
				await bot.sendMessage(message.chat.id, 'Choose inbound', {
					reply_markup: {
						inline_keyboard: [
							...result.obj.map(inbound => [
								{
									text: `${inbound.id} (${inbound.protocol})`,
									callback_data: JSON.stringify({
										s: CommandScope.Keys,
										c: {
											cmd: VPNKeyCommand.Create,
											pr: VPNProtocol.XUI,
											id: inbound.id,
										},
										p: 1,
									}),
								} as InlineKeyboardButton,
							]),
						],
					},
				});
			}

			this.setCreateStep('inbound');
			return;
		}
		if (this.createSteps.inboundId) {
			if (context.id) {
				this.params.set('inbound_id', context.id);
			}
		}
		const id = await this.service.create(
			message.chat.id,
			this.params.get('username'),
			this.params.get('telegram_id'),
			this.params.get('inbound_id'),
		);
		if (id) {
			const inbound = this.inbounds.find(i => i.id == (this.params.get('inbound_id') ?? 1));
			const streamSettings = JSON.parse(inbound.streamSettings);
			await bot.sendMessage(
				message.chat.id,
				`vless://${id}@${env.XUI_ADDRESS}:443?type=${streamSettings.network}&security=${streamSettings.security}&pbk=${streamSettings.realitySettings.settings.publicKey}&fp=${streamSettings.realitySettings.settings.fingerprint}&sni=${streamSettings.realitySettings.serverNames[0]}&sid=${streamSettings.realitySettings.shortIds[0]}&spx=%2F&flow=xtls-rprx-vision#vless-${this.params.get('username')}`,
			);
		}
		this.params.clear();
		this.inbounds = [];
		globalHandler.finishCommand();
	}

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
			const streamSettings: StreamSettings = JSON.parse(inbound.streamSettings);
			const sniffingSettings: SniffingSettings = JSON.parse(inbound.sniffing);
			await bot.sendMessage(
				chatId,
				`Inbound params:
id: ${inbound.id}
enabled: ${inbound.enable}
protocol: ${inbound.protocol}
sniffing params: ${JSON.stringify(sniffingSettings)}
stream settings: ${JSON.stringify(streamSettings)}
                `,
			);
			await bot.sendMessage(chatId, 'Inbound clients');
			const settings: XSettings = JSON.parse(inbound.settings);
			for (const client of settings.clients) {
				await bot.sendMessage(
					chatId,
					`
id: \`${client.id.replace(/[-.*#_]/g, match => `\\${match}`)}\`					
enabled: ${client.enable}
username: ${client.email.replace(/[-.*#_]/g, match => `\\${match}`)}  
tg: ${client.tgId}
flow: ${client.flow.replace(/[-.*#_]/g, match => `\\${match}`)}       
\`vless://${client.id.replace(/[-.*#_]/g, match => `\\${match}`)}@${env.XUI_ADDRESS}:443?type=${streamSettings.network}&security=${streamSettings.security}&pbk=${streamSettings.realitySettings.settings.publicKey}&fp=${streamSettings.realitySettings.settings.fingerprint}&sni=${streamSettings.realitySettings.serverNames[0]}&sid=${streamSettings.realitySettings.shortIds[0]}&spx=%2F&flow=${client.flow}#vless-${client.email}\`
                    `,
					{
						parse_mode: 'MarkdownV2',
					},
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

	async delete(message: Message, context: KeysContext, start: boolean) {
		this.log('delete');

		if (start) {
			const result = await this.service.getAll(message.chat.id);
			if (!result.success) {
				await bot.sendMessage(message.chat.id, `Error while fetching X-UI inbounds: ${result.msg}`);
				logger.error(`Error while fetching X-UI inbounds: ${result.msg}`);
				return;
			}
			this.inbounds = result.obj;
			await bot.sendMessage(message.chat.id, 'Choose inbound', {
				reply_markup: {
					inline_keyboard: [
						...result.obj.map(inbound => [
							{
								text: `${inbound.id} (${inbound.protocol})`,
								callback_data: JSON.stringify({
									s: CommandScope.Keys,
									c: {
										cmd: VPNKeyCommand.Delete,
										pr: VPNProtocol.XUI,
										id: inbound.id,
									},
									p: 1,
								}),
							} as InlineKeyboardButton,
						]),
					],
				},
			});
			this.setDeleteStep('inboundId');
			return;
		}
		if (this.deleteSteps.inboundId) {
			this.params.set('inbound_id', context.id);
			const selectedInbound = this.inbounds.find(i => i.id === Number(context.id));
			const settings: XSettings = JSON.parse(selectedInbound.settings);
			await bot.sendMessage(message.chat.id, 'Inbound clients. Enter UUID of user to delete');
			for (const client of settings.clients) {
				await bot.sendMessage(
					message.chat.id,
					`User ${client.email.replace(/[-.*#_]/g, match => `\\${match}`)} UUID \`${client.id.replace(/[-.*#_]/g, match => `\\${match}`)}\``,
					{
						parse_mode: 'MarkdownV2',
					},
				);
			}
			this.setDeleteStep('user');
			return;
		}
		if (this.deleteSteps.user) {
			this.params.set('uuid', message.text);
		}

		await this.service.delete(message.chat.id, this.params.get('uuid'), this.params.get('inbound_id'));
		this.params.clear();
		this.inbounds = [];
		globalHandler.finishCommand();
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}

	private setCreateStep(current: string) {
		setActiveStep(current, this.createSteps);
	}

	private setDeleteStep(current: string) {
		setActiveStep(current, this.deleteSteps);
	}
}
