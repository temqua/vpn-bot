import { VPNProtocol } from '../../enums';
import { CertificatesService } from './certificates.service';

export const servicesMap = {
	[VPNProtocol.WG]: new CertificatesService(VPNProtocol.WG),
	[VPNProtocol.IKEv2]: new CertificatesService(VPNProtocol.IKEv2),
	[VPNProtocol.OpenVPN]: new CertificatesService(VPNProtocol.OpenVPN),
};
