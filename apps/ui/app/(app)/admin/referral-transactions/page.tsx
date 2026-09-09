import ReferralTransactionsClientSide from '@/features/referral-transactions/components/all';
import { referralTransactionsSSRClient } from '@/features/referral-transactions/lib/ssr-client';
import { usersSSRClient } from '@/features/users/lib/ssr-client';
import { redirect } from 'next/navigation';

export default async function ReferralTransactionsPage(props: {
	searchParams: Promise<{
		page?: string;
		take?: string;
		id?: string;
		referredId?: string;
		referrerId?: string;
		paymentId?: string;
	}>;
}) {
	const searchParams = await props.searchParams;
	const page = Number(searchParams.page) || 1;
	const take = Number(searchParams.take) || 25;
	const id = searchParams.id || '';
	const referrerId = searchParams.referrerId || '';
	const referredId = searchParams.referredId || '';
	const paymentId = searchParams.paymentId || '';
	if (!searchParams.page || !searchParams.take) {
		const params = new URLSearchParams();
		params.set('page', page.toString());
		params.set('take', take.toString());
		for (const [key, value] of Object.entries(searchParams)) {
			if (value) {
				params.set(key, value);
			}
		}
		redirect(`/admin/referral-transactions?${params.toString()}`);
	}
	const refPromise = referralTransactionsSSRClient.getAll({
		skip: (page - 1) * take,
		take,
		...(id && { id }),
		...(referredId && { referredId }),
		...(referrerId && { referrerId }),
		...(paymentId && { paymentId }),
	});
	const usersPromise = usersSSRClient.getAll({
		select: ['id', 'username'],
	});
	const [usersResponse, refResponse] = await Promise.all([usersPromise, refPromise]);
	return (
		<ReferralTransactionsClientSide
			initialData={refResponse.data}
			count={refResponse.count}
			users={usersResponse.data.map(user => ({ label: user.username, value: user.id.toString() }))}
		/>
	);
}
