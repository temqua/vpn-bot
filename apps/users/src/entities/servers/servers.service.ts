import { VPNProtocol, VpnServer } from '@prisma/client';
import { Message } from 'node-telegram-bot-api';
import { basename } from 'path';
import bot from '../../bot';
import { CmdCode, CommandScope, ServerCommand } from '../../enums';
import env from '../../env';
import { globalHandler } from '../../global.handler';
import logger from '../../logger';
import { setActiveStep } from '../../utils';
import { CertificatesService } from '../keys/certificates.service';
import { getServerKeyboard } from './servers.buttons';
import { ServersRepository } from './servers.repository';
import { ServersContext } from './servers.types';

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
			await bot.sendMessage(message.chat.id, info, {
				reply_markup: {
					inline_keyboard: getServerKeyboard(server.id),
				},
			});
		}
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
			const messag = await bot.sendMessage(chatId, 'Enter new server name');
			this.params.set('message_id', messag.message_id);
			this.setCreateStep('name');
			return;
		}
		if (this.createSteps.name) {
			this.params.set('name', message?.text);
			await bot.editMessageText('Enter URL', {
				message_id: this.params.get('message_id'),
				chat_id: chatId,
			});
			this.setCreateStep('url');
			return;
		}
		this.params.set('url', message?.text);

		const params = this.params;
		try {
			const created = await this.repository.create(params.get('name'), params.get('url'));
			if (created) {
				await bot.editMessageText(
					`Server ${created.name} with URL ${created.url} has been successfully created`,
					{
						chat_id: chatId,
						message_id: this.params.get('message_id'),
						reply_markup: {
							inline_keyboard: getServerKeyboard(created.id),
						},
					},
				);
			} else {
				logger.error(`[${basename(__filename)}]: Server was not created for unknown reason`);
				await bot.editMessageText('Server was not created for unknown reason', {
					chat_id: chatId,
					message_id: this.params.get('message_id'),
				});
			}
		} catch (error) {
			const errorMessage = `Unexpected error occurred while creating server. ${error}`;
			logger.error(`[${basename(__filename)}]: ${errorMessage}`);
			await bot.editMessageText(errorMessage, {
				chat_id: chatId,
				message_id: this.params.get('message_id'),
			});
		} finally {
			this.params.clear();
			this.resetCreateSteps();
			globalHandler.finishCommand();
		}
	}

	async delete(msg: Message, context: ServersContext, start = false) {
		this.log('delete');
		if (!start) {
			const messageId = this.params.get('message_id') ?? msg.message_id;
			const message = `Server with id ${context.id} has been successfully removed`;
			try {
				await this.repository.delete(Number(context.id));
				logger.success(`[${basename(__filename)}]: ${message}`);
				await bot.editMessageText(message, {
					message_id: messageId,
					chat_id: msg.chat.id,
				});
			} catch (error) {
				await bot.editMessageText(`Error while removing ${error} server`, {
					chat_id: messageId,
					message_id: msg.message_id,
				});
			} finally {
				this.params.clear();
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
		const message = await bot.sendMessage(msg.chat.id, 'Select server to delete:', {
			reply_markup: {
				inline_keyboard: [...buttons],
			},
		});
		this.params.set('message_id', message.message_id);
	}

	async createKey(message: Message, context: ServersContext, start = false) {
		this.log('createKey');
		this.keyAction(
			message,
			context,
			ServerCommand.CreateKey,
			`Error occurred while creating key ${message.text} on the server`,
			async url => {
				const keysService = new CertificatesService(this.params.get('protocol'), url);
				await keysService.create(message, message.text, this.params.get('message_id'));
			},
			start,
		);
	}

	async export(message: Message, context: ServersContext, start = false) {
		this.log('export');
		this.keyAction(
			message,
			context,
			ServerCommand.Export,
			`Error occurred while exporting key ${message.text} from the server`,
			async url => {
				const keysService = new CertificatesService(this.params.get('protocol'), url);
				await keysService.export(message, message.text, this.params.get('message_id'));
			},
			start,
		);
	}

	async deleteKey(message: Message, context: ServersContext, start = false) {
		this.log('deleteKey');
		this.keyAction(
			message,
			context,
			ServerCommand.DeleteKey,
			`Error occurred while deleting key ${message.text} from the server`,
			async url => {
				const keysService = new CertificatesService(this.params.get('protocol'), url);
				await keysService.delete(message, message.text, this.params.get('message_id'));
			},
			start,
		);
	}

	async getKeyFile(message: Message, context: ServersContext, start = false) {
		this.log('getKeyFile');
		this.keyAction(
			message,
			context,
			ServerCommand.GetKeyFile,
			`Error occurred while loading key ${message.text} file from the server`,
			async url => {
				const keysService = new CertificatesService(this.params.get('protocol'), url);
				await keysService.getFile(message, message.text);
			},
			start,
		);
	}

	async keyAction(
		message: Message,
		context: ServersContext,
		command: ServerCommand,
		errorMessage: string,
		action: (url: string) => Promise<void>,
		start = false,
	) {
		if (start) {
			this.params.set('serverId', context.id);
			const buttons = Object.values(VPNProtocol).map(p => [
				{
					text: p,
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Servers,
						[CmdCode.Context]: {
							[CmdCode.Command]: command,
							pr: p.substring(0, 1),
						} as ServersContext,
						[CmdCode.Processing]: 1,
					}),
				},
			]);
			const messag = await bot.sendMessage(message.chat.id, 'Select protocol', {
				reply_markup: {
					inline_keyboard: [...buttons],
				},
			});
			this.params.set('message_id', messag.message_id);
			this.params.set('protocolStep', true);
			return;
		} else if (this.params.get('protocolStep') === true) {
			this.params.delete('protocolStep');
			const protocol =
				context.pr === 'I'
					? VPNProtocol.IKEv2
					: context.pr === 'W'
						? VPNProtocol.WireGuard
						: VPNProtocol.OpenVPN;
			this.params.set('protocol', protocol);
			if (command !== ServerCommand.ListKeys) {
				await bot.editMessageText('Enter key username', {
					message_id: this.params.get('message_id'),
					chat_id: message.chat.id,
				});
				return;
			}
		}

		let server: VpnServer;

		try {
			server = await this.repository.getById(Number(this.params.get('serverId')));
		} catch (error) {
			await bot.editMessageText(`Error occurred while loading server by id ${error}`, {
				chat_id: message.chat.id,
				message_id: this.params.get('server_id'),
			});
		}
		try {
			await action(server.url);
		} catch (error) {
			await bot.editMessageText(`${errorMessage} ${server.name} ${error}`, {
				chat_id: message.chat.id,
				message_id: this.params.get('server_id'),
			});
		} finally {
			this.params.clear();
			globalHandler.finishCommand();
		}
	}

	async listKeys(message: Message, context: ServersContext, start: boolean) {
		this.log('listKeys');
		this.keyAction(
			message,
			context,
			ServerCommand.ListKeys,
			'Error occurred while loading keys for server',
			async url => {
				const keysService = new CertificatesService(this.params.get('protocol'), url);
				await keysService.getAll(message, this.params.get('message_id'));
			},
			start,
		);
	}

	async updateURL(message: Message, context: ServersContext, start: boolean) {
		this.log('updateURL');

		if (start) {
			this.params.set('serverId', context.id);
			const messg = (await bot.editMessageText('Enter new URL', {
				message_id: message.message_id,
				chat_id: message.chat.id,
			})) as Message;
			this.params.set('message_id', messg.message_id);
			return;
		}
		try {
			const updated = await this.repository.update(this.params.get('serverId'), {
				url: message.text,
			});
			await bot.editMessageText(
				`Successfully updated URL to ${message.text}.
${updated.name}
URL: ${updated.url}				`,
				{
					message_id: this.params.get('message_id'),
					chat_id: message.chat.id,
					reply_markup: {
						inline_keyboard: getServerKeyboard(updated.id),
					},
				},
			);
		} catch (error) {
			await bot.editMessageText(`Error occurred while updating server URL ${error}`, {
				message_id: this.params.get('message_id'),
				chat_id: message.chat.id,
			});
		} finally {
			this.params.clear();
			globalHandler.finishCommand();
		}
	}

	async updateName(message: Message, context: ServersContext, start: boolean) {
		this.log('updateName');
		if (start) {
			this.params.set('serverId', context.id);
			const messg = (await bot.editMessageText('Enter new name', {
				message_id: message.message_id,
				chat_id: message.chat.id,
			})) as Message;
			this.params.set('message_id', messg.message_id);
			return;
		}
		try {
			const updated = await this.repository.update(this.params.get('serverId'), {
				name: message.text,
			});
			await bot.editMessageText(
				`Successfully updated name to ${message.text}.
${updated.name}
URL: ${updated.url}`,
				{
					message_id: this.params.get('message_id'),
					chat_id: message.chat.id,
					reply_markup: {
						inline_keyboard: getServerKeyboard(updated.id),
					},
				},
			);
		} catch (error) {
			await bot.editMessageText(`Error occurred while updating server URL ${error}`, {
				message_id: this.params.get('message_id'),
				chat_id: message.chat.id,
			});
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
