import { CmdCode, PlanCommand, UpdatePlanPropsMap } from '../../enums';

export interface PlansContext {
	[CmdCode.Command]: PlanCommand;
	id?: string;
	propId?: UpdatePlanPropsMap;
	prop?: string;
	setNull?: boolean;
}

export interface CreatePlanDto {
	name: string;

	amount: number;

	price: number;

	minCount: number;

	maxCount: number;

	monthsCount: number;
}
