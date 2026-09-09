import { cleanEnv, json, num, str } from 'envalid';
import { config } from 'dotenv';
config();

const env = cleanEnv(process.env, {
  DATABASE_URL: str({ default: '' }),
  PORT: num({ default: 3002 }),
  API_TOKEN: str({ default: '' }),
  APP_ENV: str({ default: 'local' }),
  SSL_PATH: str({ default: '' }),
  RW_API_ROOT: str({ default: '' }),
  RW_USERNAME: str({ default: '' }),
  RW_PW: str({ default: '' }),
  RW_TOKEN: str({ default: '' }),
  SHEET_ID: str({ default: '' }),
  JWT_SECRET: str({ default: '' }),
  SALT_ROUNDS: num({ default: 10 }),
  SERVICE_TOKEN: str({ default: '' }),
  HOST_URL: str({ default: 'http://172.17.0.1' }),
  IKE_RECEIVER_PORT: num({ default: 8090 }),
  WG_RECEIVER_PORT: num({ default: 8091 }),
  OVPN_RECEIVER_PORT: num({ default: 8092 }),
  BOT_TOKEN: str({ default: '' }),
  TG_NOTIFICATIONS_CHAT_ID: str({ default: '' }),
  CORS_ALLOWED_ORIGINS: json({ default: '[]' }),
  NALOG_USERNAME: str({ default: '' }),
  NALOG_PASSWORD: str({ default: '' }),
  NALOG_DEVICE_ID: str({ default: '' }),
});

export default env;
