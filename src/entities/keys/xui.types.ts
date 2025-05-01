export interface XUIBaseResponse {
	success: boolean;
	msg: string;
	obj: unknown;
}

export type XUINewClientSettings = {
	id: string;
	flow: string;
	email: string;
	limitIp: number;
	totalGB: number;
	expiryTime: number;
	enable: boolean;
	tgId: string;
	subId: string;
	reset: number;
};

export type XUINewClient = {
	id: number;
	settings: string;
};

export interface XUIInboundsResponse extends XUIBaseResponse {
	obj: XInbound[];
}

export type XInbound = {
	id: number;
	up: number;
	down: number;
	total: number;
	remark: string;
	enable: boolean;
	expiryTime: number;
	listen: string;
	port: number;
	protocol: string;
	settings: string;
	streamSettings: string;
	tag: string;
	sniffing: string;
	allocate: string;
	clientStats: XClientStat[];
};

export type XClientStat = {
	id: number;
	inboundId: number;
	enable: boolean;
	email: string;
	up: number;
	down: number;
	expiryTime: number;
	total: number;
	reset: number;
};

export interface XUILoginResponse extends XUIBaseResponse {
	obj: null;
}

export interface XOnlineClientsResponse extends XUIBaseResponse {
	obj: string[];
}
