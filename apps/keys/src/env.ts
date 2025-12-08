import { cleanEnv, str, num } from 'envalid';

const env = cleanEnv(process.env, {
	IKE_CLIENTS_DIR: str({ default: '/srv/ikev2/clients' }),
	WG_CLIENTS_DIR: str({ default: '/srv/wireguard/clients' }),
	OVPN_CLIENTS_DIR: str({ default: '/srv/openvpn/clients' }),
	HOST_URL: str({ default: 'http://172.17.0.1' }),
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
