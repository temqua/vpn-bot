import path from 'node:path';
import { ICertificatesService } from '../../contracts';
import env from '../../env';

export class WireguardKeysService implements ICertificatesService {
	port: number;
	constructor() {
		this.port = env.WG_RECEIVER_PORT;
	}
	getFileInfo(username: string) {
		const filePath = path.resolve(env.WG_CLIENTS_DIR, `${username}/`, `${username}.conf`);
		return {
			path: filePath,
			extension: 'conf',
		};
	}

	getQRCodePath(username: string): string {
		return path.resolve(env.WG_CLIENTS_DIR, `${username}/`, `${username}.png`);
	}
}
