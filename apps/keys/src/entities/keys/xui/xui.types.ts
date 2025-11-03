export interface XUIBaseResponse {
	success: boolean;
	msg: string;
	obj: unknown;
}

export type XRayClientSettings = {
	id: string;
	flow: string;
	email: string;
	limitIp: number;
	totalGB: number;
	expiryTime: number;
	enable: boolean;
	reset: number;
	subId?: string;
	tgId: number | '';
};

export type XSettings = {
	clients: XRayClientSettings[];
};

export type XRayNewClient = {
	id: number;
	settings: string;
};

export interface XUIInboundsResponse extends XUIBaseResponse {
	obj: XRayInbound[];
}

export type XRayInbound = {
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

export type StreamSettings = {
	network: string;
	security: string;
	externalProxy: unknown[];
	realitySettings: {
		show: boolean;
		xver: number;
		dest: string;
		serverNames: string[];
		privateKey: string;
		minClient: number | '';
		maxClient: number | '';
		maxTimediff: number;
		shortIds: string[];
		settings: {
			publicKey: string;
			fingerprint: string;
			servername: string;
			spiderX: string;
		};
	};
	tcpSettings: {
		acceptProxyProtocol: boolean;
		header: {
			type: string;
		};
	};
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

export type SniffingSettings = {
	enabled: boolean;
	destOverride: string[];
	metadataOnly: boolean;
	routeOnly: boolean;
};
