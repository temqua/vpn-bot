export enum VPNProtocol {
	WG = 'wg',
	IKEv2 = 'ikev2',
	Outline = 'outline',
	OpenVPN = 'openvpn',
	XUI = 'xui',
}

export enum CmdCode {
	Processing = 'p',
	Context = 'c',
	Scope = 's',
	Command = 'cmd',
	Protocol = 'pr',
	SubOperation = 'subo',
}

export enum VPNKeyCommand {
	Create = 'cr',
	List = 'list',
	Delete = 'del',
	GetFile = 'f',
	GetUser = 'get',
	Expand = 'e',
	Export = 'ex',
	GetOnline = 'go',
	SetDataLimit = 'sdl',
	RemoveDataLimit = 'rdl',
	Rename = 'ren',
}

export enum CommandScope {
	Keys = 'keys',
}

export enum UserRequest {
	Create,
	Update,
	Pay,
	Lookup,
	Get,
	XUI,
}

export enum BoolFieldState {
	True = 'true',
	False = 'false',
}
