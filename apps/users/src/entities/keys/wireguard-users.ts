import env from '../../env';
import { ICertificatesService } from './keys.types';

export class WireguardKeysService implements ICertificatesService {
	port: number;
	constructor() {
		this.port = env.WG_RECEIVER_PORT;
	}

	getExtension(): string {
		return 'conf';
	}
}
