import type { Message } from 'node-telegram-bot-api';
import type { ICertificatesService } from '../../core/contracts';
import { VPNProtocol } from '../../core/enums';
import { IKEv2KeysService } from './ikev2-users';
import { WireguardKeysService } from './wireguard-users';

export class CertificatesService {
	private service: ICertificatesService;
	constructor(private protocol: VPNProtocol) {
		this.service = this.protocol === VPNProtocol.IKEv2 ? new IKEv2KeysService() : new WireguardKeysService();
	}

	async create(message: Message, username: string) {
		await this.service.create(message, username);
	}
	async getFile(message: Message, username: string) {
		await this.service.getFile(message, username);
	}

	async delete(message: Message, username: string) {
		await this.service.delete(message, username);
	}

	async getAll(message: Message) {
		await this.service.getAll(message);
	}
}
