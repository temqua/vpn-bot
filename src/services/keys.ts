import type { Message } from 'node-telegram-bot-api';
import { VPNProtocol } from '../core/enums';
import { IKEv2KeysService } from './ikev2-users';
import { OutlineKeysService } from './outline-users';
import { WireguardKeysService } from './wireguard-users';

class KeysService {
	private ikev2Service = new IKEv2KeysService();
	private wgService = new WireguardKeysService();
	private outlineService = new OutlineKeysService();
	async create(message: Message, username: string, protocol: VPNProtocol) {
		if (protocol === VPNProtocol.Outline) {
			await this.outlineService.create(message, username);
		} else if (protocol === VPNProtocol.IKEv2) {
			await this.ikev2Service.create(message, username);
		} else {
			await this.wgService.create(message, username);
		}
	}
	async getFile(message: Message, username: string, protocol: VPNProtocol) {
		if (protocol === VPNProtocol.IKEv2) {
			await this.ikev2Service.getFile(message, username);
		} else {
			await this.wgService.getFile(message, username);
		}
	}
	async getAll(message: Message, protocol: VPNProtocol) {
		if (protocol === VPNProtocol.Outline) {
			await this.outlineService.getAll(message);
		} else if (protocol === VPNProtocol.IKEv2) {
			await this.ikev2Service.getAll(message);
		} else {
			await this.wgService.getAll(message);
		}
	}
	async delete(message: Message, username: string, protocol: VPNProtocol) {
		if (protocol === VPNProtocol.Outline) {
			await this.outlineService.delete(message, username);
		} else if (protocol === VPNProtocol.IKEv2) {
			await this.ikev2Service.delete(message, username);
		} else {
			await this.wgService.delete(message, username);
		}
	}
}

export const keysService = new KeysService();
