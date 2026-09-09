import NewPaymentClientSide from '@/features/payments/components/new-payment';
import { plansSSRClient } from '@/features/plans/lib/ssr-client';
import { usersSSRClient } from '@/features/users/lib/ssr-client';

export default async function NewPaymentPage() {
	const usersPromise = usersSSRClient.getAll({
		select: ['id', 'username'],
	});
	const plansPromise = plansSSRClient.getAll({
		select: ['id', 'name'],
	});
	const [usersResponse, plansResponse] = await Promise.all([usersPromise, plansPromise]);
	return (
		<NewPaymentClientSide
			users={usersResponse.data.map(user => ({
				label: user.username,
				value: user.id.toString(),
			}))}
			plans={plansResponse.data.map(plan => ({
				label: plan.name,
				value: plan.id.toString(),
			}))}
		/>
	);
}
