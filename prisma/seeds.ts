import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
	await prisma.botMessage.upsert({
		where: {
			id: 'start-message',
		},
		update: {},
		create: {
			id: 'start-message',
			en: 'Hello! The bot is for Dagon VPN https://t.me/dagonvpn. It can remind when you have to pay and show information we store about you.',
			ru: 'Здравствуйте! Это бот для работы с Dagon VPN https://t.me/dagonvpn. Бот напомнит, когда нужно платить за VPN, а также подскажет, какая информация хранится о вас в базе.',
		},
	});
	const helpMessage = `
	/user all or /users — list all users
	/user id=<id> — get user by id
	/user unpaid — get users who didn't pay for the current month
	/user username=<username> — get user by dagon vpn username
	/user tg=<telegram_username> — get user by telegram username
	/user file <username> — get zip archive with vpn configs
	/user pay username=<username> <count> — set user with username paid for count months. If count is omitted, set to 1 
	/user create <querystring>— Send data about new user in query string format like this:
	username=testuser&telegram_username=tttt&desktop_os=Windows&device_os=Android&first_name=Artem&last_name=N&phone=1234456&payment_count=100&payment_day=1&auto_pay=true
	/user update <querystring>— Send data about new user in query string format like this:
	telegram_username=tttt&desktop_os=Windows&device_os=Android&first_name=Artem&last_name=N&phone=1234456&payment_count=100&payment_day=1&paid_months_count&auto_pay=true`;

	await prisma.botMessage.upsert({
		where: {
			id: 'users-help',
		},
		create: {
			id: 'users-help',
			en: helpMessage,
			ru: helpMessage,
		},
		update: {
			id: 'users-help',
			en: helpMessage,
			ru: helpMessage,
		},
	});
}
main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async e => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
