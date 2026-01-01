import type { CallbackQuery, Message, User } from 'node-telegram-bot-api';
import type { ICommandHandler } from '../../contracts';
import { CmdCode, PaymentCommand } from '../../enums';
import { PaymentsService } from './payments.service';
import type { PaymentsContext } from './payments.types';

class PaymentsCommandsHandler implements ICommandHandler {
	constructor(private service: PaymentsService = new PaymentsService()) {}

	async handle(context: PaymentsContext, message: Message, from: User, start = false) {
		if (context[CmdCode.Command] === PaymentCommand.List) {
			await this.service.showAll(message);
		}
		if (context[CmdCode.Command] === PaymentCommand.Delete) {
			await this.service.delete(message, start);
		}
		if (context[CmdCode.Command] === PaymentCommand.DeleteExec) {
			await this.service.deleteExecuted(message, context);
		}
		if (context[CmdCode.Command] === PaymentCommand.GetById) {
			await this.service.getById(message, start);
		}
		if (context[CmdCode.Command] === PaymentCommand.FindByDate) {
			await this.service.findByDate(message, start);
		}
		if (context[CmdCode.Command] === PaymentCommand.Sum) {
			await this.service.sum(message.chat.id);
		}
		if (context[CmdCode.Command] === PaymentCommand.FindByDateRange) {
			await this.service.findByDateRange(message, start);
		}
	}

	async handleQuery(context: PaymentsContext, query: CallbackQuery, start = false) {
		this.handle(context, query.message, query.from, start);
	}
}

export const paymentsCommandsHandler = new PaymentsCommandsHandler();
