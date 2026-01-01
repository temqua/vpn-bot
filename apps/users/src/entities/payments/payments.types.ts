import { CmdCode, PaymentCommand } from '../../enums';

export interface PaymentsContext {
	[CmdCode.Command]: PaymentCommand;
	id?: string;
}
