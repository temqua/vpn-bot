import { cleanEnv, str, num } from 'envalid';

const env = cleanEnv(process.env, {
	ADMIN_USER_ID: num({ default: 190349851 }),
	BACKUPS_BOT_TOKEN: str({ default: '' }),
	DB_HOST: str({ default: '' }),
	DB_PORT: str({ default: '' }),
	DB_NAME: str({ default: '' }),
	DB_USER: str({ default: '' }),
	DB_PWD: str({ default: '' }),
});

export default env;
