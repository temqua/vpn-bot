'use client';
import ContentArea from '@/app/components/content-area';
import { FieldSet } from '@/app/components/field';
import FormField from '@/app/components/form-field';
import { Input } from '@/app/components/input';
import { IVPNUser } from '@/app/lib/api/users/definitions';
import { useActionState, useState } from 'react';
import { UserFormState } from '../lib/definitions';
import { getUpdateAction } from '@/app/lib/actions/users';
import { Button } from '@/app/components/button';

// username: string;
// password: string | null;
// telegramId: string | null;
// telegramLink: string | null;
// createdAt: string;
// firstName: string | null;
// lastName: string | null;
// languageCode: string | null;
// price: number;
// free: boolean;
// active: boolean;
// bank: string | null;
// currency: string;
// subLink: string | null;
// pasarguardUsername: string | null;
// pasarguardId: number | null;
// rwLink: string | null;
// rwUsername: string | null;
// rwId: number | null;
// rwUUID: string | null;
// payerId: number | null;
// referrerId: number | null;
// muted: boolean | null;

export default function UserClientSide({ user, id }: { user: IVPNUser; id: string }) {
	const updateAction = getUpdateAction(id);

	const [state, formAction, isPendingUpdate] = useActionState<UserFormState, FormData>(updateAction, {});

	const [username, setUsername] = useState(user?.username);
	const [telegramId, setTelegramId] = useState(user?.telegramId ?? '');
	const [telegramLink, setTelegramLink] = useState(user?.telegramLink ?? '');
	const [firstName, setFirstName] = useState(user?.firstName ?? '');
	const [lastName, setLastName] = useState(user?.lastName ?? '');
	const [price, setPrice] = useState(user?.price.toString());
	const [rwLink, setRWLink] = useState(user?.rwLink ?? '');
	const [free, setFree] = useState<boolean>(user?.free);
	const [active, setActive] = useState<boolean>(user?.active);
	return (
		<ContentArea>
			<form action={formAction}>
				<FieldSet>
					<FormField id="username" label="Username" errors={state?.errors?.properties?.username?.errors}>
						<Input
							value={username}
							onChange={event => setUsername(event.target.value)}
							id="username"
							name="username"
							placeholder="Username"
							aria-invalid={Boolean(state?.errors?.properties?.username?.errors?.length)}
						/>
					</FormField>
					<FormField
						id="telegramId"
						label="Telegram ID"
						errors={state?.errors?.properties?.telegramId?.errors}
					>
						<Input
							value={telegramId}
							onChange={event => setTelegramId(event.target.value)}
							id="telegramId"
							name="telegramId"
							placeholder="Telegram ID"
							aria-invalid={Boolean(state?.errors?.properties?.telegramId?.errors?.length)}
						/>
					</FormField>
					<FormField
						id="telegramLink"
						label="Telegram Link"
						errors={state?.errors?.properties?.telegramLink?.errors}
					>
						<Input
							value={telegramLink}
							onChange={event => setTelegramLink(event.target.value)}
							id="telegramLink"
							name="telegramLink"
							placeholder="Telegram Link"
							aria-invalid={Boolean(state?.errors?.properties?.telegramLink?.errors?.length)}
						/>
					</FormField>
					<FormField id="firstName" label="First Name" errors={state?.errors?.properties?.firstName?.errors}>
						<Input
							value={firstName}
							onChange={event => setFirstName(event.target.value)}
							id="firstName"
							name="firstName"
							placeholder="First name"
							aria-invalid={Boolean(state?.errors?.properties?.firstName?.errors?.length)}
						/>
					</FormField>
					<FormField id="lastName" label="Last Name" errors={state?.errors?.properties?.lastName?.errors}>
						<Input
							value={lastName}
							onChange={event => setLastName(event.target.value)}
							id="lastName"
							name="lastName"
							placeholder="Last name"
							aria-invalid={Boolean(state?.errors?.properties?.lastName?.errors?.length)}
						/>
					</FormField>
					<FormField id="price" label="Price" errors={state?.errors?.properties?.price?.errors}>
						<Input
							value={price}
							onChange={event => setPrice(event.target.value)}
							id="price"
							name="price"
							placeholder="Price"
							type="number"
							min="1"
							aria-invalid={Boolean(state?.errors?.properties?.price?.errors?.length)}
						/>
					</FormField>
					<FormField id="rwLink" label="Remnawave Link" errors={state?.errors?.properties?.rwLink?.errors}>
						<Input
							value={rwLink}
							onChange={event => setRWLink(event.target.value)}
							id="rwLink"
							name="rwLink"
							placeholder="rwLink"
							aria-invalid={Boolean(state?.errors?.properties?.rwLink?.errors?.length)}
						/>
					</FormField>
					<FormField id="free" label="Free" errors={state?.errors?.properties?.free?.errors}>
						<Input
							className="w-fit"
							fullWidth={false}
							checked={free}
							onChange={event => {
								setFree(event.target.checked);
							}}
							type="checkbox"
							id="free"
							name="free"
							placeholder="Free"
							aria-invalid={Boolean(state?.errors?.properties?.free?.errors?.length)}
						/>
					</FormField>
					<FormField id="active" label="Active" errors={state?.errors?.properties?.active?.errors}>
						<Input
							fullWidth={false}
							className="w-fit"
							checked={active}
							onChange={event => setActive(event.target.checked)}
							type="checkbox"
							id="active"
							name="active"
							placeholder="Active"
							aria-invalid={Boolean(state?.errors?.properties?.active?.errors?.length)}
						/>
					</FormField>
					<Button type="submit">Submit</Button>
				</FieldSet>
			</form>
		</ContentArea>
	);
}
