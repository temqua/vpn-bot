import { cleanEnv, str, num } from 'envalid';

const env = cleanEnv(process.env, {
	CREATE_PATH: str({ default: '/app/scripts/create-client.sh' }),
	DELETE_PATH: str({ default: '/app/scripts/remove-client.sh' }),
	IKE_CONTAINER_DIR: str({ default: '/app/ikev2-clients' }),
	WG_CONTAINER_DIR: str({ default: '/app/wg-clients' }),
	IKE_CLIENTS_DIR: str({ default: '/root/ikev2-clients' }),
	WG_CLIENTS_DIR: str({ default: '/root/wg-clients' }),
	ADMIN_USER_ID: num({ default: 190349851 }),
	OUTLINE_API_ROOT: str({ default: '' }),
	BOT_TOKEN: str({ default: '' }),
});

export default env;
