import { OrderDirection } from '@/app/lib/enums';
import UsersClientSide from '@/features/users/components/all';
import { usersSSRClient } from '@/features/users/lib/ssr-client';
import { redirect } from 'next/navigation';

export default async function UsersPage(props: {
	searchParams: Promise<{
		page?: string;
		take?: string;
		id?: string;
		username?: string;
		firstName?: string;
		lastName?: string;
		telegramId?: string;
		telegramLink?: string;
		price?: string;
		active?: string;
		free?: string;
		muted?: string;
		orderBy?: string;
		orderDirection?: OrderDirection;
	}>;
}) {
	const searchParams = await props.searchParams;

	const page = Number(searchParams.page) || 1;
	const take = Number(searchParams.take) || 25;
	const id = searchParams.id || '';
	const username = searchParams.username || '';
	const firstName = searchParams.firstName || '';
	const lastName = searchParams.lastName || '';
	const telegramId = searchParams.telegramId || '';
	const telegramLink = searchParams.telegramLink || '';
	const price = searchParams.price || '';
	const active = searchParams.active || '';
	const free = searchParams.free || '';
	const muted = searchParams.muted || '';
	const orderBy = searchParams.orderBy;
	const orderDirection = searchParams.orderDirection;
	if (!searchParams.page || !searchParams.take) {
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('take', take.toString());
		for (const [key, value] of Object.entries(searchParams)) {
			if (value) {
				params.set(key, value);
			}
		}
		redirect(`/admin/users?${params.toString()}`);
	}
	const response = await usersSSRClient.getAll({
		skip: (page - 1) * take,
		take,
		...(id && { id }),
		...(username && { username }),
		...(firstName && { firstName }),
		...(lastName && { lastName }),
		...(telegramId && { telegramId }),
		...(telegramLink && { telegramLink }),
		...(price && { price }),
		...(active && { active }),
		...(free && { free }),
		...(muted && { muted }),
		...(orderBy && { orderBy }),
		...(orderDirection && { orderDirection }),
	});
	return <UsersClientSide initialData={response.data} count={response.count}></UsersClientSide>;
}
