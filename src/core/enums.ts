export enum VPNProtocol {
	WG = 'wg',
	IKEv2 = 'ikev2',
	Outline = 'outline',
}

export enum VPNKeyCommand {
	Create = 'cr',
	List = 'l',
	Delete = 'd',
	GetFile = 'f',
	GetUser = 'g',
}

export enum VPNUserCommand {
	Create = 'cr',
	List = 'l',
	Delete = 'd',
	GetUser = 'g',
	Update = 'u',
	Pay = 'p',
	Sync = 's',
}

export enum CommandScope {
	Keys = 'keys',
	Users = 'users',
}
