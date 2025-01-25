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
	GetUser = 'u',
}

export enum VPNUserCommand {
	Create = 'cr',
	List = 'l',
	Delete = 'd',
	GetUser = 'u',
}

export enum CommandScope {
	Keys = 'keys',
	Users = 'users',
}
