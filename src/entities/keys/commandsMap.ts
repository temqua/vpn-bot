import { VPNKeyCommand } from '../../core/enums';

export default {
	[VPNKeyCommand.Create]: 'create',
	[VPNKeyCommand.List]: 'getAll',
	[VPNKeyCommand.Delete]: 'delete',
	[VPNKeyCommand.GetFile]: 'getFile',
	[VPNKeyCommand.GetUser]: 'getUser',
};
