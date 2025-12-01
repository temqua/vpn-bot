import { homedir } from 'node:os';
import path from 'node:path';
import { ICertificatesService } from '../../contracts';
import env from '../../env';

export class OpenVPNKeysService implements ICertificatesService {
	port: number;
	constructor() {
		this.port = env.OVPN_RECEIVER_PORT
	}
	getFileInfo(username: string) {
		const filePath = path.resolve(homedir(), env.OVPN_CLIENTS_DIR, `${username}.ovpn`);
		return {
			path: filePath,
			extension: 'ovpn',
		};
	}
}
