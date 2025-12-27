import { CmdCode, ServerCommand } from '../../enums';

export interface ServersContext {
	[CmdCode.Command]: ServerCommand;
	id?: string;
}
