import { User } from '@prisma/client';
import { CmdCode, UpdateUserPropsMap, VPNUserCommand } from '../../enums';

export interface UsersContext {
	[CmdCode.Command]: VPNUserCommand;
	id?: string;
	sid?: string;
	skip?: 0 | 1;
	accept?: 0 | 1;
	propId?: UpdateUserPropsMap;
	prop?: keyof User;
	chatId?: number;
	payerId?: string;
	pr?: 'I' | 'W' | 'O';
	a?: string;
	username?: string;
	[CmdCode.SubOperation]?: VPNUserCommand;
}

export interface UserCreateCommandContext extends UsersContext {
	chatId: number;
}

export interface UserUpdateCommandContext extends UsersContext {
	prop?: keyof User;
	chatId: number;
	setNull?: boolean;
}
