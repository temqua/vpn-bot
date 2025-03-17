type XUINewClientSettings = {
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

type XUINewClient = {
	id: number;
	settings: string;
};
