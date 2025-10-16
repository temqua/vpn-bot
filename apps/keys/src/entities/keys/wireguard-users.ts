import { homedir } from 'node:os';
import path from 'node:path';
import env from '../../env';
import { ICertificatesService } from '../../contracts';

export class WireguardKeysService implements ICertificatesService {
	getFileInfo(username: string) {
		const filePath = path.resolve(homedir(), env.WG_CONTAINER_DIR, `${username}.conf`);
		return {
			path: filePath,
			extension: 'conf',
		};
	}
}
