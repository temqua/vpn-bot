export enum VPNProtocol {
	WG = 'wg',
	IKEv2 = 'ikev2',
	Outline = 'outline',
}

export enum VPNKeyCommand {
	Create = 'cr',
	List = 'list',
	Delete = 'del',
	GetFile = 'f',
	GetUser = 'g',
}

export enum VPNUserCommand {
	Create = 'cr',
	List = 'list',
	Delete = 'del',
	GetUser = 'g',
	Update = 'u',
	Pay = 'pay',
	Sync = 'sync',
}

export enum CommandScope {
	Keys = 'keys',
	Users = 'users',
}

export enum UserRequest {
	Create,
	Update,
	Pay,
	Lookup,
}
