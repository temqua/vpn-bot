import NewPaymentClientSide from '@/features/payments/components/new-payment';
import { usersSSRClient } from '@/features/users/lib/ssr-client';

export default async function NewPaymentPage() {
	const usersResponse = await usersSSRClient.getAll({
		select: ['id', 'username'],
	});
	return (
		<NewPaymentClientSide
			users={usersResponse.data.map(u => ({
				label: u.username,
				value: u.id.toString(),
			}))}
		/>
	);
}
