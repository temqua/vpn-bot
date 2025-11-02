import { VPNKeyCommand } from '../../enums';

export default {
	[VPNKeyCommand.Create]: 'create',
	[VPNKeyCommand.List]: 'getAll',
	[VPNKeyCommand.Delete]: 'delete',
	[VPNKeyCommand.GetFile]: 'getFile',
	[VPNKeyCommand.GetUser]: 'getUser',
	[VPNKeyCommand.Export]: 'export',
	[VPNKeyCommand.GetQR]: 'getQRCode',
};
