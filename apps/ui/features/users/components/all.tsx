'use client';
import ActionsCell from '@/app/components/actions-cell';
import ContentArea from '@/app/components/content-area';
import { Input } from '@/app/components/input';
import { Select } from '@/app/components/select';
import Table, { IColumn } from '@/app/components/table';
import { usersClient } from '@/app/lib/api/users/client';
import { IVPNUserListDTO, IVPNUserUI } from '@/app/lib/api/users/definitions';
import { IListParams } from '@/app/lib/definitions.global';
import { OrderDirection } from '@/app/lib/enums';
import { useUpdateParams } from '@/app/lib/use-update-params';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CreditCard, Mail, Pencil, Server } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';
const baseColumns: IColumn<IVPNUserUI>[] = [
	{ label: 'ID', prop: 'id', sortable: true },
	{ label: 'Username', prop: 'username', sortable: true },
	{ label: 'First name', prop: 'firstName', sortable: true },
	{ label: 'Last name', prop: 'lastName', sortable: true },
	{ label: 'Telegram ID', prop: 'telegramId', sortable: true },
	{ label: 'Telegram Link', prop: 'telegramLink' },
	{ label: 'Price', prop: 'price' },
	{ label: 'Active', prop: 'active' },
	{ label: 'Free', prop: 'free' },
	{ label: 'Muted', prop: 'muted' },
];

interface IUsersPageProps {
	initialData: IVPNUserListDTO[];
	count?: number;
}

interface IUserForm {
	id?: string;
	username?: string;
	firstName?: string;
	lastName?: string;
	telegramId?: string;
	telegramLink?: string;
	price?: string;
	free?: string;
	active?: string;
	muted?: string;
}
interface IUserFormWithOrder extends IUserForm {
	orderBy?: keyof IUserForm;
	orderDirection?: OrderDirection;
}

export default function UsersClientSide({ initialData, count }: IUsersPageProps) {
	const searchParams = useSearchParams();

	const page = Number(searchParams.get('page')) || 1;
	const take = Number(searchParams.get('take')) || 25;
	const id = searchParams.get('id') || '';
	const price = searchParams.get('price') || '';
	const active = searchParams.get('active') || '';
	const free = searchParams.get('free') || '';
	const muted = searchParams.get('muted') || '';
	const username = searchParams.get('username') || '';
	const firstName = searchParams.get('firstName') || '';
	const lastName = searchParams.get('lastName') || '';
	const telegramId = searchParams.get('telegramId') || '';
	const telegramLink = searchParams.get('telegramLink') || '';
	const orderBy = (searchParams.get('orderBy') as keyof IUserForm) || '';
	const orderDirection = (searchParams.get('orderDirection') as OrderDirection) || '';
	const updateParams = useUpdateParams(useRouter(), usePathname());

	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const debouncedUpdateFilter = useCallback(
		(key: string, value: string) => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
			debounceTimer.current = setTimeout(() => {
				updateParams({ [key]: value, page: 1 }); // сброс страницы при новом фильтре
			}, 500);
		},
		[updateParams],
	);

	const columns: IColumn<IVPNUserUI>[] = [
		...baseColumns,
		{
			label: 'Actions',
			actions: row => {
				return (
					<ActionsCell>
						<Link href={`/admin/users/${row.id}`}>
							<Pencil />
						</Link>
						<Link href={`/admin/bot-delivered-messages?userId=${row.id}`}>
							<Mail />
						</Link>
						<Link href={`/admin/payments?userId=${row.id}`}>
							<CreditCard />
						</Link>
						<Link href={`/admin/users/${row.id}/servers`}>
							<Server />
						</Link>
					</ActionsCell>
				);
			},
		},
	];

	const { data: fetched, isLoading } = useQuery({
		queryKey: [
			'users',
			page,
			take,
			id,
			username,
			firstName,
			lastName,
			active,
			free,
			muted,
			orderBy,
			orderDirection,
			telegramId,
			price,
			telegramLink,
		],
		queryFn: () => {
			const params: IListParams & IUserFormWithOrder = { skip: (page - 1) * take, take };
			if (id) params.id = id;
			if (username) params.username = username;
			if (firstName) params.firstName = firstName;
			if (lastName) params.lastName = lastName;
			if (telegramId) params.telegramId = telegramId;
			if (active) params.active = active;
			if (free) params.free = free;
			if (muted) params.muted = muted;
			if (price) params.price = price;
			if (telegramLink) params.telegramLink = telegramLink;
			if (orderBy) params.orderBy = orderBy;
			if (orderDirection) params.orderDirection = orderDirection;
			return usersClient.getAll(params);
		},
		placeholderData: keepPreviousData,
		initialData: page === 1 ? { data: initialData, count: count ?? 0 } : undefined,
	});

	const prepared: IVPNUserUI[] =
		fetched?.data.map(u => {
			return {
				id: u.id,
				active: u.active,
				username: u.username,
				createdAt: u.createdAt,
				firstName: u.firstName,
				lastName: u.lastName,
				free: u.free,
				muted: u.muted,
				price: u.price,
				telegramId: u.telegramId,
				telegramLink: u.telegramLink,
				password: u.password,
				languageCode: u.languageCode,
			};
		}) ?? [];

	const handlePageChange = useCallback(
		(newPage: number | ((p: number) => number)) => {
			const resolved = typeof newPage === 'function' ? newPage(page) : newPage;
			updateParams({ page: resolved });
		},
		[page, updateParams],
	);

	const handleTakeChange = useCallback(
		(newTake: number | ((t: number) => number)) => {
			const resolved = typeof newTake === 'function' ? newTake(take) : newTake;
			updateParams({ take: resolved, page: 1 });
		},
		[take, updateParams],
	);
	const handleSort = useCallback(
		(prop?: keyof IVPNUserUI) => {
			if (!prop) {
				return;
			}
			const newDirection = orderDirection ? (orderDirection === 'asc' ? 'desc' : 'asc') : 'asc';
			updateParams({ orderBy: prop, orderDirection: newDirection });
		},
		[orderDirection],
	);
	const searchRow = useMemo(
		() => (
			<>
				<th>
					<Input
						type="search"
						placeholder="ID"
						defaultValue={id}
						onChange={e => debouncedUpdateFilter('id', e.target.value)}
					/>
				</th>
				<th>
					<Input
						type="search"
						placeholder="Username"
						defaultValue={username}
						onChange={e => debouncedUpdateFilter('username', e.target.value)}
					/>
				</th>
				<th>
					<Input
						type="search"
						placeholder="First name"
						defaultValue={firstName}
						onChange={e => debouncedUpdateFilter('firstName', e.target.value)}
					/>
				</th>
				<th>
					<Input
						type="search"
						placeholder="Last name"
						defaultValue={lastName}
						onChange={e => debouncedUpdateFilter('lastName', e.target.value)}
					/>
				</th>
				<th>
					<Input
						type="search"
						placeholder="Telegram ID"
						defaultValue={telegramId}
						onChange={e => debouncedUpdateFilter('telegramId', e.target.value)}
					/>
				</th>
				<th>
					<Input
						type="search"
						placeholder="Telegram Link"
						defaultValue={telegramLink}
						onChange={e => debouncedUpdateFilter('telegramLink', e.target.value)}
					/>
				</th>
				<th>
					<Select onChange={event => debouncedUpdateFilter('price', event.target.value)}>
						<option value=""></option>
						<option value="80">80</option>
						<option value="150">150</option>
					</Select>
				</th>
				<th>
					<Select onChange={event => debouncedUpdateFilter('active', event.target.value)}>
						<option value=""></option>
						<option value="true">True</option>
						<option value="false">False</option>
					</Select>
				</th>
				<th>
					<Select onChange={event => debouncedUpdateFilter('free', event.target.value)}>
						<option value=""></option>
						<option value="true">True</option>
						<option value="false">False</option>
					</Select>
				</th>
				<th>
					<Select onChange={event => debouncedUpdateFilter('muted', event.target.value)}>
						<option value=""></option>
						<option value="true">True</option>
						<option value="false">False</option>
					</Select>
				</th>
				<th></th>
			</>
		),
		[debouncedUpdateFilter],
	);

	return (
		<div>
			<ContentArea>
				<Table
					loading={isLoading}
					columns={columns}
					data={prepared}
					count={fetched?.count ?? 0}
					page={page}
					take={take}
					searchRow={searchRow}
					onChangePage={handlePageChange}
					onChangeTake={handleTakeChange}
					onSort={handleSort}
				/>
			</ContentArea>
		</div>
	);
}
