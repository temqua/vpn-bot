import client from '../../client';
import env from '../../env';

export type NalogAuthResponse = {
	refreshToken: string;
	refreshTokenExpiresIn: string | null;
	token: string;
	tokenExpireIn: string;
	profile: {
		lastName: unknown | null;
		id: number;
		displayName: string | null;
		middleName: string | null;
		email: string | null;
		phone: string | null;
		inn: string | null;
		snils: string;
		avatarExists: boolean;
		initialRegistrationDate: string;
		registrationDate: string;
		firstReceiptRegisterTime: string;
		firstReceiptCancelTime: string;
		hideCancelledReceipt: boolean;
		registerAvailable: unknown | null;
		status: string;
		restrictedMode: boolean;
		pfrUrl: string | null;
		login: unknown | null;
	};
};

export type NalogIncomeResponse = {
	approvedReceiptUuid: string;
};

export type NalogErrorMessage = {
	code?: string;
	message: string;
	exceptionMessage?: string;
};

export class NalogService {
	private apiRoot = 'https://lknpd.nalog.ru/api/v1';

	async auth(): Promise<string> {
		const body = {
			username: env.NALOG_USERNAME,
			password: env.NALOG_PASSWORD,
			deviceInfo: {
				'sourceDeviceId': env.NALOG_DEVICE_ID,
				'sourceType': 'WEB',
				'appVersion': '1.0.0',
				'metaDetails': {
					'userAgent':
						'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
				},
			},
		};
		const response = await client.post(`${this.apiRoot}/auth/lkfl`, {
			body: JSON.stringify(body),
		});
		const responseBody = (await response.json()) as NalogAuthResponse & NalogErrorMessage;
		if (!response.ok) {
			const errorMessage = responseBody.message ?? response.statusText;
			throw new Error(errorMessage);
		}
		return responseBody?.token;
	}

	async addNalog(token: string, amount: number): Promise<string> {
		const body = {
			operationTime: new Date().toISOString(),
			requestTime: new Date().toISOString(),
			services: [
				{
					name: 'Аренда сервера',
					amount: amount,
					quantity: 1,
				},
			],
			totalAmount: amount.toString(),
			client: {
				contactPhone: null,
				displayName: null,
				inn: null,
				incomeType: 'FROM_INDIVIDUAL',
			},
			paymentType: 'CASH',
			ignoreMaxTotalIncomeRestriction: false,
		};
		const response = await client.post(`${this.apiRoot}/income`, {
			body: JSON.stringify(body),
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		const responseBody = (await response.json()) as NalogIncomeResponse & NalogErrorMessage;
		if (!response.ok) {
			const errorMessage = responseBody.exceptionMessage
				? responseBody.exceptionMessage
				: responseBody.message
					? responseBody.message
					: response.statusText;
			throw new Error(errorMessage);
		}
		return responseBody.approvedReceiptUuid;
	}
}
