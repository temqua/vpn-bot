'use client';

import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from '@/app/components/combobox';
import ContentArea from '@/app/components/content-area';
import { Input } from '@/app/components/input';
import Table, { IColumn } from '@/app/components/table';
import { deliveredMessagesClient } from '@/app/lib/api/bot-delivered-messages/client';
import { IBotDeliveredMessageUI } from '@/app/lib/api/bot-delivered-messages/definitions';
import { IListParams } from '@/app/lib/definitions.global';
import { OrderDirection } from '@/app/lib/enums';
import { useUpdateParams } from '@/app/lib/use-update-params';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

interface IDeliveredMessagesPageProps {
	count: number;
	initialData: IBotDeliveredMessageUI[];
	users: {
		label: string;
		value: string;
	}[];
}

const baseColumns: IColumn<IBotDeliveredMessageUI>[] = [
	{
		label: 'ID',
		prop: 'id',
		sortable: true,
	},
	{
		label: 'Message',
		prop: 'message',
	},
	{
		label: 'User',
		prop: 'userId',
		sortable: true,
	},
	{
		label: 'Username',
		prop: 'username',
	},
	{
		label: 'Created At',
		prop: 'createdAt',
		sortable: true,
	},
	// {
	// 	label: 'Telegram ID',
	// 	prop: 'user.telegramId',
	// 	searchable: true,
	// },
];

interface IBotDeliveredMessageForm {
	id?: string;
	telegramId?: string;
	createdAt?: string;
	userId?: string;
}

interface IBotDeliveredMessageFormWithOrder extends IBotDeliveredMessageForm {
	orderBy?: keyof IBotDeliveredMessageForm;
	orderDirection?: OrderDirection;
}

export default function DeliveredMessagesClientSide({ initialData, count, users }: IDeliveredMessagesPageProps) {
	const searchParams = useSearchParams();
	const id = searchParams.get('id') || '';
	const userId = searchParams.get('userId') || '';
	const page = Number(searchParams.get('page')) || 1;
	const take = Number(searchParams.get('take')) || 25;
	const orderBy = (searchParams.get('orderBy') as keyof IBotDeliveredMessageForm) || '';
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
	const { data: fetched, isLoading } = useQuery({
		queryKey: ['bot-delivered-messages', page, take, id, userId, orderBy, orderDirection],
		queryFn: () => {
			const params: IListParams & IBotDeliveredMessageFormWithOrder = { skip: (page - 1) * take, take };
			if (id) params.id = id;
			if (userId) params.userId = userId;
			if (orderBy) params.orderBy = orderBy;
			if (orderDirection) params.orderDirection = orderDirection;
			return deliveredMessagesClient.getAll(params).then(r => {
				return {
					...r,
					data: r.data.map(
						record =>
							({
								id: record.id,
								message: record.message,
								userId: record.userId,
								createdAt: record.createdAt,
								username: record.user.username,
							}) as IBotDeliveredMessageUI,
					),
				};
			});
		},
		placeholderData: keepPreviousData,
		initialData: page === 1 ? { data: initialData, count: count ?? 0 } : undefined,
	});

	const columns: IColumn<IBotDeliveredMessageUI>[] = [...baseColumns];
	const searchRow = useMemo(
		() => (
			<>
				<th>
					<Input
						type="search"
						placeholder={'ID'}
						onChange={event => debouncedUpdateFilter('id', event.target.value)}
					></Input>
				</th>
				<th></th>
				<th>
					<Combobox
						items={users}
						value={userId ?? undefined}
						onValueChange={v => {
							debouncedUpdateFilter('userId', v ?? '');
						}}
					>
						<ComboboxInput placeholder="Select user"></ComboboxInput>
						<ComboboxContent>
							<ComboboxEmpty>No users found.</ComboboxEmpty>
							<ComboboxList>
								{item => (
									<ComboboxItem key={item.value} value={item.value}>
										{item.label}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</th>
				<th></th>
				<th></th>
				{/* <th>
					<Input
						type="search"
						placeholder={'Telegram ID'}
						onChange={event => debouncedUpdateFilter('telegramId', event.target.value)}
					></Input>
				</th> */}
			</>
		),
		[debouncedUpdateFilter],
	);
	const handleSort = useCallback(
		(prop?: keyof IBotDeliveredMessageUI) => {
			if (!prop) {
				return;
			}
			const newDirection = orderDirection ? (orderDirection === 'asc' ? 'desc' : 'asc') : 'asc';
			updateParams({ orderBy: prop, orderDirection: newDirection });
		},
		[orderDirection],
	);
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
	return (
		<div>
			<ContentArea>
				<Table
					loading={isLoading}
					page={page}
					take={take}
					searchRow={searchRow}
					columns={columns}
					count={fetched?.count ?? 0}
					data={fetched?.data ?? []}
					onChangePage={handlePageChange}
					onChangeTake={handleTakeChange}
					onSort={handleSort}
				/>
			</ContentArea>
		</div>
	);
}
