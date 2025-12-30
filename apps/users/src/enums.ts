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
	Delete = 'del',
}

export enum ServerCommand {
	Create = 'cr',
	List = 'list',
	ListUsers = 'listu',
	Edit = 'e',
	Delete = 'del',
}

export enum VPNUserCommand {
	AssignKey = 'ask',
	Create = 'cr',
	CreateSubscription = 'crs',
	CreateKey = 'crk',
	List = 'list',
	Delete = 'del',
	DeleteSubscription = 'dels',
	DeleteKey = 'delk',
	GetById = 'getid',
	FindByUsername = 'findus',
	GetByTelegramId = 'gettg',
	FindByFirstName = 'findfn',
	Keys = 'ks',
	Update = 'u',
	UpdateNull = 'un',
	Pay = 'pay',
	Export = 'ex',
	ExportPayments = 'exp',
	ExportExpenses = 'expe',
	Expand = 'e',
	ShowPayments = 'sp',
	ShowUnpaid = 'su',
	NotifyUnpaid = 'nu',
	ShowSubLink = 'ssl',
	ShowSubLinkGuide = 'sslg',
	ShowTrial = 'st',
	ShowPlans = 'shpl',
	ShowMenu = 'sm',
	UnassignKey = 'uask',
}

export enum PaymentCommand {
	Delete = 'delete',
	List = 'list',
	GetById = 'getid',
	FindByDate = 'find',
	FindByDateRange = 'findr',
	Sum = 'sum',
}

export enum PlanCommand {
	Create = 'create',
	List = 'list',
	Delete = 'del',
}

export enum CommandScope {
	Users = 'users',
	Expenses = 'expenses',
	Payments = 'payments',
	Plans = 'plans',
	Servers = 'servers',
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

export enum UpdatePropsMap {
	username = 'u',
	telegramId = 't',
	telegramLink = 'tl',
	firstName = 'f',
	lastName = 'l',
	price = 'p',
	devices = 'd',
	protocols = 'pr',
	bank = 'b',
	active = 'a',
	free = 'fr',
	payerId = 'pid',
	subLink = 's',
}
