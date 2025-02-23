import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
	await prisma.plan.createMany({
		data: [
			{
				amount: 400,
				months: 6,
				name: 'полгода',
				price: 80,
				peopleCount: 1,
			},
			{
				amount: 800,
				months: 12,
				name: 'год',
				price: 80,
				peopleCount: 1,
			},
			{
				amount: 1000,
				months: 6,
				name: 'полгода за троих',
				peopleCount: 3,
				price: 80,
			},
			{
				amount: 2000,
				months: 12,
				name: 'год за троих',
				peopleCount: 3,
				price: 80,
			},
			{
				amount: 800,
				months: 6,
				name: 'полгода c 2025',
				peopleCount: 1,
				price: 150,
			},
			{
				amount: 1500,
				months: 12,
				name: 'год c 2025',
				peopleCount: 1,
				price: 150,
			},
		],
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
