import { cleanEnv, str, num } from 'envalid';

const env = cleanEnv(process.env, {
	CREATE_PATH: str({ default: '/app/scripts/create-client.sh' }),
	DELETE_PATH: str({ default: '/app/scripts/remove-client.sh' }),
	IKE_CLIENTS_DIR: str({ default: '/etc/ipsec.d/clients' }),
	WG_CLIENTS_DIR: str({ default: '/etc/wireguard/clients' }),
	OVPN_CLIENTS_DIR: str({ default: '/etc/openvpn/clients' }),
	IKE_RECEIVER_PORT: num({ default: 8090 }),
	WG_RECEIVER_PORT: num({ default: 8091 }),
	OVPN_RECEIVER_PORT: num({ default: 8092 }),
	ADMIN_USER_ID: num({ default: 190349851 }),
	OUTLINE_API_ROOT: str({ default: '' }),
	XUI_API_ROOT: str({ default: '' }),
	XUI_USERNAME: str({ default: '' }),
	XUI_PASSWORD: str({ default: '' }),
	XUI_ADDRESS: str({ default: '' }),
	BOT_TOKEN: str({ default: '' }),
	SERVICE_TOKEN: str({ default: '' }),
});

export default env;
