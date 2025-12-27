import { CmdCode, PlanCommand } from '../../enums';

export interface PlansContext {
	[CmdCode.Command]: PlanCommand;
	id?: string;
}
