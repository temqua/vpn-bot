'use client';
import ContentArea from '@/app/components/content-area';
import { FieldSet } from '@/app/components/field';
import FormField from '@/app/components/form-field';
import { IPayment } from '@/app/lib/api/payments/definitions';
import { useActionState, useState } from 'react';
import { PaymentFormState } from '../lib/definitions';
import { createAction } from '@/app/lib/actions/payments';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/app/components/input-group';
import { isValidDate } from '@/app/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/app/components/calendar';
import { formatISO } from 'date-fns';
import { Input } from '@/app/components/input';
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from '@/app/components/combobox';
import { Button } from '@/app/components/button';

export default function NewPaymentClientSide({
	users,
}: {
	users: {
		label: string;
		value: string;
	}[];
}) {
	const [state, formAction, isPendingUpdate] = useActionState<PaymentFormState, FormData>(createAction, {});

	const [amount, setAmount] = useState(0);
	const [monthsCount, setMonthsCount] = useState(0);
	const [expiresOn, setExpiresOn] = useState('');
	const [userId, setUserID] = useState(0);
	const [expiresOnDate, setExpiresOnDate] = useState(new Date());
	const [isExpiresOnOpened, setExpiresOnOpened] = useState(false);
	return (
		<ContentArea>
			<form action={formAction}>
				<FieldSet>
					<FormField id="amount" label="Amount" errors={state?.errors?.properties?.amount?.errors}>
						<Input
							value={amount}
							onChange={event => setAmount(Number(event.target.value))}
							id="amount"
							name="amount"
							type="number"
							step="0.01"
							autoComplete="off"
							placeholder="Amount"
							aria-invalid={Boolean(state?.errors?.properties?.amount?.errors?.length)}
						/>
					</FormField>
					<FormField
						id="monthsCount"
						label="Months count"
						errors={state?.errors?.properties?.monthsCount?.errors}
					>
						<Input
							value={monthsCount}
							onChange={event => setMonthsCount(Number(event.target.value))}
							id="monthsCount"
							name="monthsCount"
							type="number"
							min="1"
							autoComplete="off"
							placeholder="Months count"
							aria-invalid={Boolean(state?.errors?.properties?.monthsCount?.errors?.length)}
						/>
					</FormField>
					<FormField id="expiresOn" label="Expires on" errors={state?.errors?.properties?.expiresOn?.errors}>
						{/* <Input
							value={expiresOn}
							onChange={event => setExpiresOn(event.target.value)}
							id="expiresOn"
							name="expiresOn"
							autoComplete="off"
							placeholder="Expires On"
							aria-invalid={Boolean(state?.errors?.properties?.expiresOn?.errors?.length)}
						/> */}
						<InputGroup>
							<InputGroupInput
								id="expiresOn"
								name="expiresOn"
								value={expiresOn}
								placeholder="Expires On"
								readOnly
								onChange={e => {
									const date = new Date(e.target.value);
									setExpiresOn(e.target.value);
									if (isValidDate(date)) {
										setExpiresOnDate(date);
									}
								}}
								onKeyDown={e => {
									if (e.key === 'ArrowDown') {
										e.preventDefault();
										setExpiresOnOpened(true);
									}
								}}
								aria-invalid={Boolean(state?.errors?.properties?.expiresOn?.errors?.length)}
							/>
							<InputGroupAddon align="inline-end">
								<Popover open={isExpiresOnOpened} onOpenChange={setExpiresOnOpened}>
									<PopoverTrigger
										render={
											<InputGroupButton
												id="date-picker"
												variant="ghost"
												size="icon-xs"
												aria-label="Select date"
											>
												<CalendarIcon />
												<span className="sr-only">Select date</span>
											</InputGroupButton>
										}
									/>
									<PopoverContent
										className="w-auto overflow-hidden p-0"
										align="end"
										alignOffset={-8}
										sideOffset={10}
									>
										<Calendar
											mode="single"
											selected={expiresOnDate}
											onSelect={date => {
												if (date) {
													setExpiresOnDate(date);
													setExpiresOn(formatISO(date));
												}
												setExpiresOnOpened(false);
											}}
										/>
									</PopoverContent>
								</Popover>
							</InputGroupAddon>
						</InputGroup>
					</FormField>
					<FormField id="userId" label="User" errors={state?.errors?.properties?.userId?.errors}>
						<Combobox
							items={users}
							value={userId ?? undefined}
							onValueChange={v => {
								setUserID(Number(v));
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
						{/* <Input
							value={userId}
							onChange={event => setUserID(Number(event.target.value))}
							id="userId"
							name="userId"
							min="1"
							autoComplete="off"
							placeholder="User ID"
							type="number"
							aria-invalid={Boolean(state?.errors?.properties?.userId?.errors?.length)}
						/> */}
					</FormField>
					{/* <div className="flex flex-col">
                    <label htmlFor="planId">Plan ID</label>
                    <Input
                        value={planId}
                        onChange={event => setPlanID(Number(event.target.value))}
                        id="planId"
                        name="planId"
                        autoComplete="off"
                        placeholder="Plan ID"
                    />
                </div>
                {state?.errors?.properties?.planId && <p>{state.errors?.properties.planId?.errors.join()}</p>} */}
					<Button type="submit">Submit</Button>
					{state?.errors?.errors?.length ? state?.errors?.errors.join(',') : ''}
					{state?.data?.id ? `Successfully created payment ${state?.data.id}` : ''}
				</FieldSet>
			</form>
		</ContentArea>
	);
}
