export enum VPNProtocol {
	WG = 'wg',
	IKEv2 = 'ikev2',
	Outline = 'outline',
	OpenVPN = 'openvpn',
}

export enum VPNKeyCommand {
	Create = 'cr',
	List = 'list',
	Delete = 'del',
	GetFile = 'f',
	GetUser = 'get',
	Expand = 'e',
	Export = 'ex',
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
	Export = 'ex',
	ExportPayments = 'exp',
	Expand = 'e',
	ShowPayments = 'sp',
	ShowUnpaid = 'su',
}

export enum CommandScope {
	Keys = 'keys',
	Users = 'users',
	Spendings = 'spendings',
}

export enum UserRequest {
	Create,
	Update,
	Pay,
	Lookup,
	Get,
}

export enum Bank {
	Sberbank = 'Сбербанк',
	T = 'Т-Банк',
	PSB = 'Промсвязьбанк',
	Gazprombank = 'Газпромбанк',
	Alpha = 'Альфа-банк',
	Ozon = 'Ozon Банк',
	Sovcombank = 'Совкомбанк',
	Raiffeisen = 'Райффайзен Банк',
	VTB = 'ВТБ',
	Uralsib = 'Уралсиб',
	// Pochta = 'Почта Банк',
	// Ren = 'Ренессанс Банк'
}

export enum BoolFieldState {
	True = 'true',
	False = 'false',
}
