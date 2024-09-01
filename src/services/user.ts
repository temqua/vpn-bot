import type { Message } from 'node-telegram-bot-api';
import { VPNProtocol } from '../core/enums';
import { IKEv2UsersService } from './ikev2-users';
import { WireguardUsersService } from './wireguard-users';

class UserService {
	private ikev2Service = new IKEv2UsersService();
	private wgService = new WireguardUsersService();
	async create(message: Message, username: string, protocol: VPNProtocol) {
		if (protocol === VPNProtocol.IKE2) {
			await this.ikev2Service.create(message, username);
		} else {
			await this.wgService.create(message, username);
		}
	}
	async getFile(message: Message, username: string, protocol: VPNProtocol) {
		if (protocol === VPNProtocol.IKE2) {
			await this.ikev2Service.getFile(message, username);
		} else {
			await this.wgService.getFile(message, username);
		}
	}
	async getAll(message: Message, protocol: VPNProtocol) {
		if (protocol === VPNProtocol.IKE2) {
			await this.ikev2Service.getAll(message);
		} else {
			await this.wgService.getAll(message);
		}
	}
	async delete(message: Message, username: string, protocol: VPNProtocol) {
		if (protocol === VPNProtocol.IKE2) {
			await this.ikev2Service.delete(message, username);
		} else {
			await this.wgService.delete(message, username);
		}
	}
}

export const userService = new UserService();
