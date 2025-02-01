import { Device, VPNProtocol } from '@prisma/client';

export default {
	devices: Object.values(Device),
	protocols: Object.values(VPNProtocol),
};
