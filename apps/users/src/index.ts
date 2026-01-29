import './commands/index';
import { agenda } from './jobs/agenda';
import './jobs/index';

async function boostrap() {
	await agenda.start();
	await agenda.every('1 day', 'show-unpaid');
	await agenda.every('1 day', 'notify-unpaid');
}

boostrap();
