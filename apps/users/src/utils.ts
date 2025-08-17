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
