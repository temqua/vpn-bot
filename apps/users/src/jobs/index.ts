import TelegramBot from 'node-telegram-bot-api';
import { CmdCode, CommandScope, VPNUserCommand } from '../enums';
import env from '../env';
import { globalHandler } from '../global.handler';
import logger from '../logger';
import { agenda } from './agenda';

agenda.define('show-unpaid', async () => {
	logger.log('show-unpaid job start');
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

agenda.define('notify-unpaid', async () => {
	logger.log('notify-unpaid job start');
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
