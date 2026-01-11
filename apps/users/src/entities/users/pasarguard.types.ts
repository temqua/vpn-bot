export type PasarguardAuthResponse = {
	access_token: string;
	token_type: string;
};

export type PasarguardErrorResponse = {
	detail:
		| string
		| {
				[key: string]: string;
		  };
};

export type PasarguardCreateResponse = {
	proxy_settings: {
		vmess: {
			id: string;
		};
		vless: {
			id: string;
			flow: string;
		};
		trojan: {
			password: string;
		};
		shadowsocks: {
			password: string;
			method: string;
		};
	};
	expire: unknown | null;
	data_limit: number;
	data_limit_reset_strategy: string;
	note: string;
	on_hold_expire_duration: unknown | null;
	on_hold_timeout: unknown | null;
	group_ids: number[];
	auto_delete_in_days: unknown | null;
	next_plan: unknown | null;
	id: number;
	username: string;
	status: string;
	used_traffic: number;
	lifetime_used_traffic: number;
	created_at: string;
	edit_at: unknown | null;
	online_at: unknown | null;
	subscription_url: string;
	admin: {
		username: string;
	};
};

export type PasarguardDeleteResult = {
	success: boolean;
	error: string | null;
};
