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
