export enum VPNProtocol {
	WG = 'wg',
	IKEv2 = 'ikev2',
	Outline = 'outline',
}

export enum VPNKeyCommand {
	Create = 'c',
	List = 'l',
	Delete = 'd',
	GetFile = 'f',
}

export enum VPNUserCommand {
	Create = 'c',
	List = 'l',
	Delete = 'd',
}

export enum CommandScope {
	Keys = 'k',
	Users = 'u',
}
