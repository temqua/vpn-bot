import { cleanEnv, str, num } from 'envalid';

const env = cleanEnv(process.env, {
	ADMIN_USER_ID: num({ default: 190349851 }),
	BOT_TOKEN: str({ default: '' }),
	SHEET_ID: str({ default: '' }),
	NALOG_USERNAME: str({ default: '' }),
	NALOG_PASSWORD: str({ default: '' }),
	NALOG_DEVICE_ID: str({ default: '' }),
	DATABASE_URL: str({ default: '' }),
	PASARGUARD_ROOT: str({ default: '' }),
	PASARGUARD_USERNAME: str({ default: '' }),
	PASARGUARD_PASSWORD: str({ default: '' }),
});

export default env;
