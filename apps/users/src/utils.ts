import type { Message } from 'node-telegram-bot-api';
import env from './env';
import { format } from 'date-fns';

export const isAdmin = (msg: Message): boolean => {
	return msg?.from?.id === env.ADMIN_USER_ID;
};

export const formatDate = (date: Date, dateFormat = 'yyyy-MM-dd'): string => {
	return format(date, dateFormat);
};

export function setActiveStep(current: string, steps: { [key: string]: boolean }) {
	Object.keys(steps).forEach(k => {
		steps[k] = false;
		steps[current] = true;
	});
}

export const isJSONErrorResponse = (response: Response) => {
	return response.body && response.headers.get('content-type')?.includes('json');
};

export function uuid32to36(u: string): string {
	if (!/^[0-9a-fA-F]{32}$/.test(u)) {
		throw new Error('invalid uuid32');
	}
	return (
		u.slice(0, 8) +
		'-' +
		u.slice(8, 12) +
		'-' +
		u.slice(12, 16) +
		'-' +
		u.slice(16, 20) +
		'-' +
		u.slice(20)
	).toLowerCase();
}
