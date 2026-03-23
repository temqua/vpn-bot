import { CmdCode, PaymentCommand } from '../../enums';

export interface PaymentsContext {
	[CmdCode.Command]: PaymentCommand;
	id?: string;
}

export interface CreatePaymentDto {
	userId: number;

	amount: number;

	monthsCount: number;

	expiresOn: string;

	planId?: number | null;

	parentPaymentId?: string | null;
}
