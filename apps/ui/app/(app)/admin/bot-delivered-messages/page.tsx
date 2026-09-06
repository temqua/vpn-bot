import DeliveredMessagesClientSide from '@/features/bot-delivered-messages/components/all';
import { deliveredMessagesSSRClient } from '@/features/bot-delivered-messages/lib/ssr-client';
import { usersSSRClient } from '@/features/users/lib/ssr-client';
import { redirect } from 'next/navigation';

export default async function DeliveredMessagesPage(props: {
	searchParams: Promise<{
		page?: string;
		take?: string;
		id?: string;
		username?: string;
		userId?: string;
	}>;
}) {
	const searchParams = await props.searchParams;

	const page = Number(searchParams.page) || 1;
	const take = Number(searchParams.take) || 25;
	const id = searchParams.id || '';
	const username = searchParams.username || '';
	const userId = searchParams.userId || '';
	if (!searchParams.page || !searchParams.take) {
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('take', take.toString());
		for (const [key, value] of Object.entries(searchParams)) {
			if (value) {
				params.set(key, value);
			}
		}
		redirect(`/admin/bot-delivered-messages?${params.toString()}`);
	}
	const deliveredMessagesPromise = deliveredMessagesSSRClient.getAll({
		skip: (page - 1) * take,
		take,
		...(id && { id }),
		...(userId && { userId }),
		...(username && { username }),
	});
	const usersPromise = usersSSRClient.getAll({
		select: ['id', 'username'],
	});

	const [response, usersResponse] = await Promise.all([deliveredMessagesPromise, usersPromise]);
	return (
		<DeliveredMessagesClientSide
			initialData={response.data.map(record => ({
				createdAt: record.createdAt,
				id: record.id,
				message: record.message,
				userId: record.userId,
				username: record.user.username,
			}))}
			users={usersResponse.data.map(u => ({
				value: u.id.toString(),
				label: u.username,
			}))}
			count={response.count}
		/>
	);
}
