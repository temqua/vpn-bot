import { cleanEnv, str, num } from 'envalid';

const env = cleanEnv(process.env, {
	ADMIN_USER_ID: num({ default: 190349851 }),
	BOT_TOKEN: str({ default: '' }),
	SHEET_ID: str({ default: '' }),
	NALOG_USERNAME: str({ default: '' }),
	NALOG_PASSWORD: str({ default: '' }),
	NALOG_DEVICE_ID: str({ default: '' }),
	DATABASE_URL: str({ default: '' }),
	AGENDA_DB_URL: str({ default: '' }),
	PASARGUARD_ROOT: str({ default: '' }),
	PASARGUARD_USERNAME: str({ default: '' }),
	PASARGUARD_PASSWORD: str({ default: '' }),
	SERVICE_TOKEN: str({ default: '' }),
	HOST_URL: str({ default: 'http://172.17.0.1' }),
	IKE_RECEIVER_PORT: num({ default: 8090 }),
	WG_RECEIVER_PORT: num({ default: 8091 }),
	OVPN_RECEIVER_PORT: num({ default: 8092 }),
	BOT_ENV: str({ default: 'local' }),
	PUBLIC_URL: str({ default: '' }),
});

export default env;
