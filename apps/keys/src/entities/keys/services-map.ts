import { VPNProtocol } from '../../enums';
import { CertificatesService } from './certificates.service';

export const servicesMap = new Map();
servicesMap.set(VPNProtocol.WG, new CertificatesService(VPNProtocol.WG));
servicesMap.set(VPNProtocol.IKEv2, new CertificatesService(VPNProtocol.IKEv2));
servicesMap.set(VPNProtocol.OpenVPN, new CertificatesService(VPNProtocol.OpenVPN));
