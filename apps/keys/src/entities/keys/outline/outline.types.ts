export type OutlineResponse = {
	accessKeys: OutlineKey[];
};

export type OutlineKey = {
	id: string;
	name: string;
	password: string;
	port: number;
	method: string;
	accessUrl: string;
	dataLimit: {
		bytes: number;
	};
};

export type OutlineMetricsTransfer = {
	bytesTransferredByUserId: {
		[key: string]: number;
	};
};

export type OutlineLocationMetrics = {
	location: string;
	asn: number;
	asOrg: string;
	dataTransferred: {
		bytes: number;
	};
	tunnelTime: {
		seconds: number;
	};
};

export type OutlineKeyMetrics = {
	accessKeyId: number;
	dataTransferred: {
		bytes: number;
	};
	tunnelTime: {
		seconds: number;
	};
	connection: {
		lastTrafficSeen: number | null;
		peakDeviceCount: {
			data: number;
			timestamp: number | null;
		};
	};
};

export type OutlineServerMetricsResponse = {
	server: {
		tunnelTime: {
			seconds: number;
		};
		dataTransferred: {
			bytes: number;
		};
		bandwidth: {
			current: {
				data: {
					bytes: number;
				};
				timestamp: number;
			};
			peak: {
				data: {
					bytes: number;
				};
				timestamp: number;
			};
		};
		locations: OutlineLocationMetrics[];
	};
	accessKeys: OutlineKeyMetrics[];
};
