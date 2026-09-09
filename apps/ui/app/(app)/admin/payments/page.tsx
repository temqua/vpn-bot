import { OrderDirection } from '@/app/lib/enums';
import PaymentsClientSide from '@/features/payments/components/all';
import { paymentsSSRClient } from '@/features/payments/lib/ssr-client';
import { plansSSRClient } from '@/features/plans/lib/ssr-client';
import { usersSSRClient } from '@/features/users/lib/ssr-client';
import { redirect } from 'next/navigation';

export default async function PaymentsPage(props: {
	searchParams: Promise<{
		page?: string;
		take?: string;
		id?: string;
		userId?: string;
		planId?: string;
		orderBy?: string;
		orderDirection?: OrderDirection;
		monthsCount?: string;
		amount?: string;
		from?: string;
		to?: string;
	}>;
}) {
	const searchParams = await props.searchParams;
	const page = Number(searchParams.page) || 1;
	const take = Number(searchParams.take) || 25;
	const id = searchParams.id || '';
	const monthsCount = searchParams.monthsCount || '';
	const amount = searchParams.amount || '';
	const userId = searchParams.userId || '';
	const planId = searchParams.planId || '';
	const orderBy = searchParams.orderBy;
	const orderDirection = searchParams.orderDirection;
	const from = searchParams.from;
	const to = searchParams.to;
	if (!searchParams.page || !searchParams.take) {
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('take', take.toString());
		for (const [key, value] of Object.entries(searchParams)) {
			if (value) {
				params.set(key, value);
			}
		}
		redirect(`/admin/payments?${params.toString()}`);
	}
	const paymentsPromise = paymentsSSRClient.getAll({
		skip: (page - 1) * take,
		take,
		...(id && { id }),
		...(userId && { userId }),
		...(planId && { planId }),
		...(monthsCount && { monthsCount }),
		...(amount && { amount }),
		...(from && { from }),
		...(to && { to }),
		...(orderBy && { orderBy }),
		...(orderDirection && { orderDirection }),
	});

	const usersPromise = usersSSRClient.getAll({
		select: ['id', 'username'],
	});
	const plansPromise = plansSSRClient.getAll();

	const [response, usersResponse, plansResponse] = await Promise.all([paymentsPromise, usersPromise, plansPromise]);
	const users = usersResponse.data.map(u => ({
		label: u.username,
		value: u.id.toString(),
	}));
	const plans = plansResponse.data.map(p => ({
		label: p.name,
		value: p.id.toString(),
	}));
	return <PaymentsClientSide initialData={response.data} count={response.count} users={users} plans={plans} />;
}
