import { dict } from './dict';

const plansGroupped = {
	'1': [
		{
			id: 5,
			name: 'полгода c 2025',
			amount: 800,
			months: 6,
			price: 150,
			currency: 'RUB',
			peopleCount: 1,
			createdAt: '2025-02-23T22:56:10.412Z',
		},
		{
			id: 6,
			name: 'год c 2025',
			amount: 1500,
			months: 12,
			price: 150,
			currency: 'RUB',
			peopleCount: 1,
			createdAt: '2025-02-23T22:56:10.412Z',
		},
	],
	'2': [
		{
			id: 12,
			name: 'полгода за двоих с 2025',
			amount: 1600,
			months: 6,
			price: 150,
			currency: 'RUB',
			peopleCount: 2,
			createdAt: '2025-03-07T21:57:59.809Z',
		},
		{
			id: 11,
			name: 'год за двоих с 2025',
			amount: 3000,
			months: 12,
			price: 150,
			currency: 'RUB',
			peopleCount: 2,
			createdAt: '2025-03-07T21:57:59.809Z',
		},
	],
	'3': [
		{
			id: 8,
			name: 'месяц за троих с 2025',
			amount: 400,
			months: 1,
			price: 150,
			currency: 'RUB',
			peopleCount: 3,
			createdAt: '2025-02-25T11:23:06.555Z',
		},
		{
			id: 13,
			name: 'полгода за троих с 2025',
			amount: 2200,
			months: 6,
			price: 150,
			currency: 'RUB',
			peopleCount: 3,
			createdAt: '2025-05-10T11:33:11.865Z',
		},
	],
	'4': [
		{
			id: 14,
			name: 'месяц за четверых',
			amount: 500,
			months: 1,
			price: 150,
			currency: 'RUB',
			peopleCount: 4,
			createdAt: '2025-05-10T11:33:11.865Z',
		},
		{
			id: 15,
			name: 'полгода за четверых',
			amount: 2500,
			months: 6,
			price: 150,
			currency: 'RUB',
			peopleCount: 4,
			createdAt: '2025-05-10T11:33:11.865Z',
		},
	],
};
const lang = 'ru';
const user = {
	price: 150,
};

const getPeopleCountMessage = (count: number, lang: string) => {
	if (count === 1) {
		return lang === 'en' ? '1 person' : '1 человек';
	}
	return lang === 'en' ? `${count} persons` : `${count} человек`;
};

const getMonthsCountMessage = (count: number, lang: string) => {
	if (count === 1) {
		return lang === 'en' ? '1 month' : '1 месяц';
	}
	return lang === 'en' ? `${count} months` : `${count} месяцев`;
};

const prepared = Object.keys(plansGroupped)
	.map(k => {
		const count = Number(k);
		const plans = plansGroupped[k];
		const header = `${getPeopleCountMessage(count, lang)}:\n`;
		const together = plans
			.map(p => {
				return `⚫️ ${getMonthsCountMessage(p.months, lang)} — ${p.amount} RUB`;
			})
			.join('\n');
		return count === 1 ? together : header.concat(together);
	})
	.join('\n');

const finalMessage = `${getPeopleCountMessage(1, lang)}:
⚫️${getMonthsCountMessage(1, lang)} — ${user.price} RUB`.concat(`\n${prepared}`);
console.log('finalMessage :>> ', finalMessage);
