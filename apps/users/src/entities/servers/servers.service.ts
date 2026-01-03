import { Message, SendBasicOptions } from 'node-telegram-bot-api';
import { basename } from 'path';
import bot from '../../bot';
import { CmdCode, CommandScope, ServerCommand } from '../../enums';
import env from '../../env';
import { globalHandler } from '../../global.handler';
import logger from '../../logger';
import { setActiveStep } from '../../utils';
import { ServersRepository } from './servers.repository';
import { ServersContext } from './servers.types';
import { VPNProtocol, VpnServer } from '@prisma/client';
import { CertificatesService } from '../keys/certificates.service';

export class ServersService {
	constructor(private readonly repository: ServersRepository = new ServersRepository()) {}
	createSteps: { [key: string]: boolean } = {
		name: false,
		url: false,
	};
	params = new Map();

	async list(message: Message) {
		this.log('list');
		const servers = await this.repository.getAll();

		for (const server of servers) {
			const info = `${server.name}
URL: ${server.url}            
            `;
			const keyboard: SendBasicOptions = {
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: 'Show Users',
								callback_data: JSON.stringify({
									[CmdCode.Scope]: CommandScope.Servers,
									[CmdCode.Context]: {
										[CmdCode.Command]: ServerCommand.ListUsers,
										id: server.id,
									},
								}),
							},
							{
								text: 'Show Keys',
								callback_data: JSON.stringify({
									[CmdCode.Scope]: CommandScope.Servers,
									[CmdCode.Context]: {
										[CmdCode.Command]: ServerCommand.ListKeys,
										id: server.id,
									},
								}),
							},
						],
						[
							{
								text: 'Update URL',
								callback_data: JSON.stringify({
									[CmdCode.Scope]: CommandScope.Servers,
									[CmdCode.Context]: {
										[CmdCode.Command]: ServerCommand.UpdateUrl,
										prop: 'url',
										id: server.id,
									},
								}),
							},
							{
								text: 'Update Name',
								callback_data: JSON.stringify({
									[CmdCode.Scope]: CommandScope.Servers,
									[CmdCode.Context]: {
										[CmdCode.Command]: ServerCommand.UpdateName,
										prop: 'name',
										id: server.id,
									},
								}),
							},
						],
					],
				},
			};
			await bot.sendMessage(message.chat.id, info, keyboard);
		}

		await bot.sendMessage(message.chat.id, `Total count ${servers.length}`);
		globalHandler.finishCommand();
	}

	async listServerUsers(message: Message, context: ServersContext) {
		try {
			const usersServers = await this.repository.getUsers(Number(context.id));
			const chunkSize = 50;
			const chunksCount = Math.ceil(usersServers.length / chunkSize);
			for (let i = 0; i < chunksCount; i++) {
				const chunk = usersServers.slice(i * chunkSize, i * chunkSize + chunkSize);
				await bot.sendMessage(message.chat.id, chunk.map(u => u.user.username).join(', '));
			}
			await bot.sendMessage(message.chat.id, `Server users count ${usersServers.length}`);
		} catch (error) {
			await bot.sendMessage(message.chat.id, `Error while getting servers list ${error}`);
		} finally {
			globalHandler.finishCommand();
		}
	}

	async create(message: Message | null, start = false) {
		this.log('create');
		const chatId = message ? message.chat.id : env.ADMIN_USER_ID;
		if (start) {
			await bot.sendMessage(chatId, 'Enter new server name');
			this.setCreateStep('name');
			return;
		}
		if (this.createSteps.name) {
			this.params.set('name', message?.text);
			await bot.sendMessage(chatId, 'Enter URL');
			this.setCreateStep('url');
			return;
		}
		this.params.set('url', message?.text);

		const params = this.params;
		try {
			const created = await this.repository.create(params.get('name'), params.get('url'));
			if (created) {
				await bot.sendMessage(
					chatId,
					`Server ${created.name} with URL ${created.url} has been successfully created`,
				);
			} else {
				logger.error(`[${basename(__filename)}]: Server was not created for unknown reason`);
				await bot.sendMessage(chatId, 'Server was not created for unknown reason');
			}
		} catch (error) {
			const errorMessage = `Unexpected error occurred while creating server. ${error}`;
			logger.error(`[${basename(__filename)}]: ${errorMessage}`);
			await bot.sendMessage(chatId, errorMessage);
		} finally {
			this.params.clear();
			this.resetCreateSteps();
			globalHandler.finishCommand();
		}
	}

	async delete(msg: Message, context: ServersContext, start = false) {
		this.log('delete');
		if (!start) {
			try {
				await this.repository.delete(Number(context.id));
				const message = `Server with id ${context.id} has been successfully removed`;
				logger.success(`[${basename(__filename)}]: ${message}`);
				await bot.sendMessage(msg.chat.id, message);
			} catch (error) {
				await bot.sendMessage(msg.chat.id, `Error while removing ${error} server`);
			} finally {
				globalHandler.finishCommand();
			}
			return;
		}
		const servers = await this.repository.getAll();
		const buttons = servers.map(({ name, id }) => [
			{
				text: name,
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Servers,
					[CmdCode.Context]: {
						[CmdCode.Command]: ServerCommand.Delete,
						id,
					},
					[CmdCode.Processing]: 1,
				}),
			},
		]);
		const inlineKeyboard = {
			reply_markup: {
				inline_keyboard: [...buttons],
			},
		};
		await bot.sendMessage(msg.chat.id, 'Select server to delete:', inlineKeyboard);
	}

	async listKeys(message: Message, context: ServersContext, start: boolean) {
		this.log('listKeys');

		if (start) {
			this.params.set('serverId', context.id);
			const buttons = Object.values(VPNProtocol).map(p => [
				{
					text: p,
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Servers,
						[CmdCode.Context]: {
							[CmdCode.Command]: ServerCommand.ListKeys,
							pr: p.substring(0, 1),
						} as ServersContext,
						[CmdCode.Processing]: 1,
					}),
				},
			]);
			await bot.sendMessage(message.chat.id, 'Select protocol', {
				reply_markup: {
					inline_keyboard: [...buttons],
				},
			});
			return;
		}

		const protocol =
			context.pr === 'I' ? VPNProtocol.IKEv2 : context.pr === 'W' ? VPNProtocol.WireGuard : VPNProtocol.OpenVPN;
		let server: VpnServer;

		try {
			server = await this.repository.getById(Number(this.params.get('serverId')));
		} catch (error) {
			await bot.sendMessage(message.chat.id, `Error occurred while loading server by id ${error}`);
		}
		try {
			const keysService = new CertificatesService(protocol, server.url);
			await keysService.getAll(message);
		} catch (error) {
			await bot.sendMessage(
				message.chat.id,
				`Error occurred while loading keys for server ${server.name} ${error}`,
			);
		} finally {
			this.params.clear();
			globalHandler.finishCommand();
		}
	}

	async updateURL(message: Message, context: ServersContext, start: boolean) {
		this.log('updateURL');

		if (start) {
			this.params.set('serverId', context.id);
			await bot.sendMessage(message.chat.id, 'Enter new URL');
			return;
		}
		try {
			await this.repository.update(this.params.get('serverId'), {
				url: message.text,
			});
			await bot.sendMessage(message.chat.id, `Successfully updated URL to ${message.text}`);
		} catch (error) {
			await bot.sendMessage(message.chat.id, `Error occurred while updating server URL ${error}`);
		} finally {
			this.params.clear();
			globalHandler.finishCommand();
		}
	}

	async updateName(message: Message, context: ServersContext, start: boolean) {
		this.log('updateName');
		if (start) {
			this.params.set('serverId', context.id);
			await bot.sendMessage(message.chat.id, 'Enter new name');
			return;
		}
		try {
			await this.repository.update(this.params.get('serverId'), {
				name: message.text,
			});
			await bot.sendMessage(message.chat.id, `Successfully updated name to ${message.text}`);
		} catch (error) {
			await bot.sendMessage(message.chat.id, `Error occurred while updating server URL ${error}`);
		} finally {
			this.params.clear();
			globalHandler.finishCommand();
		}
	}

	private setCreateStep(current: string) {
		setActiveStep(current, this.createSteps);
	}

	private resetCreateSteps() {
		Object.keys(this.createSteps).forEach(k => {
			this.createSteps[k] = false;
		});
	}

	private log(message: string) {
		logger.log(`[${basename(__filename)}]: ${message}`);
	}
}
