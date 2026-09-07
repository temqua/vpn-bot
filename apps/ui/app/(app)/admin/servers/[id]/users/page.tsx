import { OrderDirection } from '@/app/lib/enums';
import ServerUsersClientSide from '@/features/servers/components/users';
import { serversSSRClient } from '@/features/servers/lib/ssr-client';
import { usersSSRClient } from '@/features/users/lib/ssr-client';
import { redirect } from 'next/navigation';

export default async function ServerUsers(props: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{
		page?: string;
		take?: string;
		id?: string;
		username?: string;
		userId?: string;
		protocol?: string;
		orderBy?: string;
		orderDirection?: OrderDirection;
	}>;
}) {
	const searchParams = await props.searchParams;
	const page = Number(searchParams.page) || 1;
	const take = Number(searchParams.take) || 25;
	const orderBy = searchParams.orderBy;
	const orderDirection = searchParams.orderDirection;
	const recordId = searchParams.id || '';
	const username = searchParams.username || '';
	const userId = searchParams.userId || '';
	const protocol = searchParams.protocol || '';

	const { id } = await props.params;
	if (!searchParams.page || !searchParams.take) {
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('take', take.toString());
		for (const [key, value] of Object.entries(searchParams)) {
			if (value) {
				params.set(key, value);
			}
		}
		redirect(`/admin/servers/${id}/users?${params.toString()}`);
	}
	const usersPromise = usersSSRClient.getAll({
		select: ['id', 'username'],
	});
	const keysPromise = serversSSRClient.getUsers(id, {
		skip: (page - 1) * take,
		take,
		...(recordId && { id: recordId }),
		...(username && { username }),
		...(userId && { userId }),
		...(protocol && { protocol }),
		...(orderBy && { orderBy }),
		...(orderDirection && { orderDirection }),
	});

	const [usersResponse, keysResponse] = await Promise.all([usersPromise, keysPromise]);

	return (
		<ServerUsersClientSide
			users={usersResponse.data.map(u => ({
				label: u.username,
				value: u.id.toString(),
			}))}
			initialData={keysResponse.data}
			id={id}
			count={keysResponse.count}
		/>
	);
}
