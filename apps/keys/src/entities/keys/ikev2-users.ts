import path from 'node:path';
import { ICertificatesService } from '../../contracts';
import env from '../../env';

export class IKEv2KeysService implements ICertificatesService {
	port: number;
	constructor() {
		this.port = env.IKE_RECEIVER_PORT;
	}
	getFileInfo(username: string) {
		const filePath = path.resolve(env.IKE_CLIENTS_DIR, `${username}/`, `${username}.zip`);
		return {
			path: filePath,
			extension: 'zip',
		};
	}
}
