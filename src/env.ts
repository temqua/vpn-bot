import { cleanEnv, str, num } from 'envalid';

const env = cleanEnv(process.env, {
	CREATE_PATH: str({ default: '/app/scripts/create-client.sh' }),
	DELETE_PATH: str({ default: '/app/scripts/remove-client.sh' }),
	IKE_CONTAINER_DIR: str({ default: '/app/ikev2-clients' }),
	WG_CONTAINER_DIR: str({ default: '/app/wg-clients' }),
	OVPN_CONTAINER_DIR: str({ default: '/app/ovpn-clients' }),
	IKE_CLIENTS_DIR: str({ default: '' }),
	WG_CLIENTS_DIR: str({ default: '' }),
	OVPN_CLIENTS_DIR: str({ default: '' }),
	ADMIN_USER_ID: num({ default: 190349851 }),
	OUTLINE_API_ROOT: str({ default: '' }),
	XUI_API_ROOT: str({ default: '' }),
	XUI_USERNAME: str({ default: '' }),
	XUI_PASSWORD: str({ default: '' }),
	XUI_ADDRESS: str({ default: '' }),
	BOT_TOKEN: str({ default: '' }),
	SHEET_ID: str({ default: '' }),
	NALOG_USERNAME: str({ default: '' }),
	NALOG_PASSWORD: str({ default: '' }),
	NALOG_DEVICE_ID: str({ default: '' }),
});

export default env;
