import type { Message } from 'node-telegram-bot-api';
import env from '../env';
import { format } from 'date-fns';
import { VPNProtocol } from './enums';

export const isAdmin = (msg: Message): boolean => {
	return msg.from.id === env.ADMIN_USER_ID;
};

export const formatDate = (date: Date, dateFormat = 'dd.MM.yyyy'): string => {
	return format(date, dateFormat);
};

export function setActiveStep(current: string, steps: object) {
	Object.keys(steps).forEach(k => {
		steps[k] = false;
		steps[current] = true;
	});
}

const keysHelpMessage = Object.values(VPNProtocol)
	.filter(p => ![VPNProtocol.Outline, VPNProtocol.XUI].includes(p))
	.reduce((acc, curr) => {
		const current = `
/key create ${curr}
/key create ${curr} <username>
/key delete ${curr}
/key delete ${curr} <username> 
/key file ${curr} <username>
/keys ${curr}
	`;
		return acc + current;
	}, '');

export const adminStartMessage = `
/keys
/key
/key create
${keysHelpMessage}
/key create outline
/key delete outline
/keys outline
/key create xui
/key delete xui
/keys xui
/keys online
/user
/user create
/user delete
/user pay
/users
/users sync
/users unpaid
/payments
`;
