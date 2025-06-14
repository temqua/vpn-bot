import type { Message } from 'node-telegram-bot-api';
import type { ICertificatesService } from '../../core/contracts';
import { VPNProtocol } from '../../core/enums';
import { IKEv2KeysService } from './ikev2-users';
import { WireguardKeysService } from './wireguard-users';
import { OpenVPNKeysService } from './openvpn-users';

export class CertificatesService {
	private service: ICertificatesService;
	constructor(private protocol: VPNProtocol) {
		switch (protocol) {
			case VPNProtocol.WG:
				this.service = new WireguardKeysService();
				break;
			case VPNProtocol.OpenVPN:
				this.service = new OpenVPNKeysService();
				break;
			default:
				this.service = new IKEv2KeysService();
				break;
		}
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

	async export(message: Message, username: string) {
		await this.service.export(message, username);
	}
}
