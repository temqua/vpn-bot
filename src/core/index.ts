import type { Message } from 'node-telegram-bot-api';
import env from '../env';
import { format } from 'date-fns';

export const isAdmin = (msg: Message): boolean => {
	return msg.from.id === env.ADMIN_USER_ID;
};

export const formatDate = (date: Date, dateFormat = 'dd.MM.yyyy'): string => {
	return format(date, dateFormat);
};
