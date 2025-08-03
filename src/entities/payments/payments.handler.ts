import type { Message } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../core/contracts';
import { PaymentCommand, type CmdCode } from '../../core/enums';
import { PaymentsService } from './payments.service';

export interface PaymentsContext {
	[CmdCode.Command]: PaymentCommand;
}

class PaymentsCommandsHandler implements ICommandHandler {
	constructor(private service: PaymentsService = new PaymentsService()) {}

	async handle(context: PaymentsContext, message: Message, start = false) {
		if (context.cmd === PaymentCommand.List) {
			await this.service.showAll(message);
		}
		if (context.cmd === PaymentCommand.Delete) {
			await this.service.delete(message, start);
		}
		if (context.cmd === PaymentCommand.GetById) {
			await this.service.getById(message, start);
		}
		if (context.cmd === PaymentCommand.FindByDate) {
			await this.service.findByDate(message, start);
		}
		if (context.cmd === PaymentCommand.Sum) {
			await this.service.sum(message.chat.id);
		}
	}
}

export const paymentsCommandsHandler = new PaymentsCommandsHandler();
