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
	GetUser = 'get',
}

export enum VPNUserCommand {
	Create = 'cr',
	List = 'list',
	Delete = 'del',
	GetById = 'getid',
	FindByUsername = 'findus',
	GetByTelegramId = 'gettg',
	FindByFirstName = 'findfn',
	Update = 'u',
	Pay = 'pay',
	Sync = 'sync',
	Expand = 'e',
	ShowPayments = 'sp',
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
	Get,
}
