import { cleanEnv, num, str } from 'envalid';
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
});

export default env;
