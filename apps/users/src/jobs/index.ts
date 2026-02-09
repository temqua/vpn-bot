import TelegramBot from 'node-telegram-bot-api';
import { CmdCode, CommandScope, VPNUserCommand } from '../enums';
import env from '../env';
import { globalHandler } from '../global.handler';

async function createAgenda() {
	const { PostgresBackend } = await import('@agendajs/postgres-backend');
	const { Agenda } = await import('agenda');
	return new Agenda({
		backend: new PostgresBackend({
			connectionString: env.AGENDA_DB_URL,
		}),
	});
}

async function registerJobs() {
	const agenda = await createAgenda();
	agenda.define('show-unpaid', () => {
		globalHandler.execute(
			{
				scope: CommandScope.Users,
				context: {
					[CmdCode.Command]: VPNUserCommand.ShowUnpaid,
				},
			},
			{
				message: {
					chat: {
						id: env.ADMIN_USER_ID,
					},
				},
			} as TelegramBot.CallbackQuery,
		);
	});

	agenda.define('notify-unpaid', () => {
		globalHandler.execute(
			{
				scope: CommandScope.Users,
				context: {
					[CmdCode.Command]: VPNUserCommand.NotifyUnpaid,
				},
			},
			{
				message: {},
			} as TelegramBot.CallbackQuery,
		);
	});

	await agenda.start();
	await agenda.every('1 day', 'show-unpaid');
	await agenda.every('1 day', 'notify-unpaid');
}

registerJobs();
