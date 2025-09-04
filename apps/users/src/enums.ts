export enum CmdCode {
	Processing = 'p',
	Context = 'c',
	Scope = 's',
	Command = 'cmd',
	Protocol = 'pr',
	SubOperation = 'subo',
}

export enum ExpenseCommand {
	Create = 'cr',
	List = 'list',
	Sum = 'sum',
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
	ShowTrial = 'st',
}

export enum PaymentCommand {
	Delete = 'delete',
	List = 'list',
	GetById = 'getid',
	FindByDate = 'find',
	FindByDateRange = 'findr',
	Sum = 'sum',
}

export enum CommandScope {
	Users = 'users',
	Expenses = 'expenses',
	Payments = 'payments',
}

export enum UserRequest {
	Create,
	Update,
	Pay,
	Lookup,
	Get,
	XUI,
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
