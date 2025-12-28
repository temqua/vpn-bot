import env from '../../env';
import { ICertificatesService } from './keys.types';

export class OpenVPNKeysService implements ICertificatesService {
	port: number;
	constructor() {
		this.port = env.OVPN_RECEIVER_PORT;
	}

	getExtension(): string {
		return 'ovpn';
	}
}
