import { VPNKeyCommand } from '../../enums';
import { CertificatesService } from './certificates.service';
import { OutlineService } from './outline/outline.service';
import { XUIService } from './xui/xui.service';

export const commandsMap = new Map<
	VPNKeyCommand,
	keyof CertificatesService | keyof OutlineService | keyof XUIService
>();
commandsMap.set(VPNKeyCommand.Create, 'create');
commandsMap.set(VPNKeyCommand.List, 'getAll');
commandsMap.set(VPNKeyCommand.Delete, 'delete');
commandsMap.set(VPNKeyCommand.GetFile, 'getFile');
commandsMap.set(VPNKeyCommand.GetUser, 'getUser');
commandsMap.set(VPNKeyCommand.Export, 'export');
commandsMap.set(VPNKeyCommand.GetQR, 'getQRCode');
