import { Device, VPNProtocol } from '@prisma/client';
import { Bank, BoolFieldState } from './enums';

export default {
	devices: Object.values(Device),
	protocols: Object.values(VPNProtocol),
	bank: Object.values(Bank),
	boolFieldState: Object.values(BoolFieldState),
};
