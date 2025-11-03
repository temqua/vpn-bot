import { User } from '@prisma/client';
import { CmdCode, VPNUserCommand } from '../../enums';

export interface UsersContext {
	[CmdCode.Command]: VPNUserCommand;
	id?: string;
	skip?: 1 | 0;
	accept?: 1 | 0;
	prop?: keyof User;
	chatId?: number;
	payerId?: string;
	a?: string;
	[CmdCode.SubOperation]?: VPNUserCommand;
}

export interface UserCreateCommandContext extends UsersContext {
	chatId: number;
}

export interface UserUpdateCommandContext extends UsersContext {
	prop: keyof User;
	chatId: number;
}
