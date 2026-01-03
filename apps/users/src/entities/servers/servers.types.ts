import { CmdCode, ServerCommand } from '../../enums';

export interface ServersContext {
	[CmdCode.Command]: ServerCommand;
	id?: string;
	prop?: 'name' | 'url';
	pr?: 'I' | 'W' | 'O';
}
