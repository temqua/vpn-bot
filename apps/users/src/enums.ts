export enum CmdCode {
	Processing = 'p',
	Context = 'c',
	Scope = 's',
	Command = 'cm',
	Protocol = 'pr',
	SubOperation = 'su',
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
	ListUsers = 'lu',
	Edit = 'e',
	Delete = 'd',
	UpdateUrl = 'ur',
	UpdateName = 'un',
	ListKeys = 'lk',
	CreateKey = 'ck',
	DeleteKey = 'dk',
	Export = 'ex',
	GetKeyFile = 'gkf',
}

export enum VPNUserCommand {
	AssignKey = 'ask',
	Create = 'cr',
	CreateSubscriptionAdmin = 'crsa',
	CreateSubscription = 'crs',
	CreateKey = 'crk',
	List = 'list',
	Delete = 'del',
	DeleteSubscription = 'dels',
	DeleteSubscriptionAdmin = 'delsa',
	DeleteKey = 'delk',
	FindByUsername = 'findus',
	FindByFirstName = 'findfn',
	FindById = 'findid',
	GetById = 'getid',
	GetByTelegramId = 'gettg',
	GetKeyFile = 'gf',
	KeysAdmin = 'ksa',
	KeysUser = 'ksu',
	Update = 'u',
	UpdateNull = 'un',
	Pay = 'pay',
	PauseKey = 'pk',
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
	Delete = 'de',
	DeleteExec = 'd',
	List = 'l',
	GetById = 'g',
	FindByDate = 'f',
	FindByDateRange = 'fr',
	Sum = 's',
}

export enum PlanCommand {
	Create = 'c',
	List = 'l',
	Delete = 'del',
	Expand = 'e',
	UpdateInit = 'ui',
	Update = 'u',
	UpdateNull = 'un',
}

export enum CommandScope {
	Users = 'u',
	Expenses = 'e',
	Payments = 'p',
	Plans = 'pl',
	Servers = 's',
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

export enum UpdateUserPropsMap {
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

export enum UpdatePlanPropsMap {
	name = 'n',
	amount = 'a',
	price = 'p',
	months = 'm',
	minCount = 'min',
	maxCount = 'max',
}
