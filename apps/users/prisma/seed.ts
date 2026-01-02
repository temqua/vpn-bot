import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import env from '../src/env';
const adapter = new PrismaPg({
	connectionString: env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });
async function main() {
	await prisma.plan.createMany({
		data: [
			{
				amount: 400,
				months: 6,
				name: 'полгода',
				price: 80,
				maxCount: 1,
				minCount: 1,
			},
			{
				amount: 800,
				months: 12,
				name: 'год',
				price: 80,
				maxCount: 1,
				minCount: 1,
			},
			{
				amount: 1000,
				months: 6,
				name: 'полгода за троих',
				maxCount: 3,
				minCount: 3,
				price: 80,
			},
			{
				amount: 2000,
				months: 12,
				name: 'год за троих',
				maxCount: 3,
				minCount: 3,
				price: 80,
			},
			{
				amount: 800,
				months: 6,
				name: 'полгода c 2025',
				maxCount: 1,
				minCount: 1,
				price: 150,
			},
			{
				amount: 1500,
				months: 12,
				name: 'год c 2025',
				maxCount: 1,
				minCount: 1,
				price: 150,
			},
			{
				amount: 400,
				months: 1,
				name: 'месяц за троих c 2025',
				maxCount: 3,
				minCount: 3,
				price: 150,
			},
			{
				amount: 1600,
				months: 12,
				name: 'год за двоих',
				maxCount: 2,
				minCount: 2,
				price: 80,
			},
			{
				amount: 3000,
				months: 12,
				name: 'год за двоих c 2025',
				maxCount: 2,
				price: 150,
			},
			{
				amount: 1600,
				months: 6,
				name: 'полгода за двоих с 2025',
				maxCount: 2,
				minCount: 2,
				price: 150,
			},
			{
				amount: 800,
				months: 6,
				name: 'полгода за двоих',
				maxCount: 2,
				minCount: 2,
				price: 80,
			},
			{
				amount: 2200,
				months: 6,
				name: 'полгода за троих c 2025',
				maxCount: 3,
				minCount: 3,
				price: 150,
			},
			{
				amount: 2500,
				months: 6,
				name: 'полгода за четверых',
				maxCount: 4,
				minCount: 4,
				price: 150,
			},
			{
				amount: 500,
				months: 1,
				name: 'месяц за четверых',
				maxCount: 4,
				minCount: 4,
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
