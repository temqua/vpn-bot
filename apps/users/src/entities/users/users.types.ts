import { Device, User, VPNProtocol, VpnServer } from '@prisma/client';
import { CmdCode, UpdateUserPropsMap, VPNUserCommand } from '../../enums';
import { Message, User as TGUser } from 'node-telegram-bot-api';

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
	rid?: string;
	username?: string;
	tgid?: number;
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

export interface CreatePasarguardUserParams {
	message: Message;
	user: User;
	from?: TGUser;
	isAdmin?: boolean;
	isNew?: boolean;
	expiresOn?: Date;
}

export interface CreateUserDto {
	username: string;

	firstName: string;

	telegramId: string | null;
	telegramLink: string | null;

	lastName?: string | null;
	payerId?: number | null;
	devices?: Device[];
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
	subLink?: string | null;
	pasarguardUsername?: string | null;
	pasarguardId?: number | null;
	rwLink?: string | null;
	rwUsername?: string | null;
	rwUUID?: string | null;
	rwId?: number | null;
}

export interface SearchUserDto {
	username?: string;
	telegramId?: string;
	firstName?: string;
}

export class UserQueryDto {
	username?: string;
	telegramId?: string;
	firstName?: string;
	orderBy?: 'username' | 'firstName';
	orderDirection?: 'asc' | 'desc';
}

export interface UserServerDTO {
	id: number;
	userId: number;
	serverId: number;
	protocol: VPNProtocol;
	username: string;
	assignedAt: string;
	server: VpnServer;
	user: User;
}
