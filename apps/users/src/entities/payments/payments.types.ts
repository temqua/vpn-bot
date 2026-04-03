import { Payment, Plan } from '@prisma/client';
import { CmdCode, PaymentCommand } from '../../enums';
import { VPNUser } from '../users/users.repository';

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

export interface PaymentSumDto {
	amount: string;
}

export interface PaymentForSheet extends Payment {
	user: VPNUser;
	plan: Plan;
}
