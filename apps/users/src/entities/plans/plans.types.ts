import { CmdCode, PlanCommand, UpdatePlanPropsMap } from '../../enums';

export interface PlansContext {
	[CmdCode.Command]: PlanCommand;
	id?: string;
	propId?: UpdatePlanPropsMap;
	prop?: string;
	setNull?: boolean;
}
