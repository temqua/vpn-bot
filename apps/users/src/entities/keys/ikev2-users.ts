import env from '../../env';
import { ICertificatesService } from './keys.types';

export class IKEv2KeysService implements ICertificatesService {
	port: number;
	constructor() {
		this.port = env.IKE_RECEIVER_PORT;
	}
}
