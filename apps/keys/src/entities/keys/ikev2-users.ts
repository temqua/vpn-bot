import path from 'node:path';
import { ICertificatesService } from '../../contracts';
import env from '../../env';

export class IKEv2KeysService implements ICertificatesService {
	getFileInfo(username: string) {
		const filePath = path.resolve(env.IKE_CONTAINER_DIR, `${username}/`, `${username}.zip`);
		return {
			path: filePath,
			extension: 'zip',
		};
	}
}
