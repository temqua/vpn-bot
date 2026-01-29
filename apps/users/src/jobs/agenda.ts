import { PostgresBackend } from '@agendajs/postgres-backend';
import { Agenda } from 'agenda';
import env from '../env';

export const agenda = new Agenda({
	backend: new PostgresBackend({
		connectionString: env.AGENDA_DB_URL,
	}),
});
