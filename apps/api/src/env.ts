import { cleanEnv, num, str } from 'envalid';
import { config } from 'dotenv';
config();

const env = cleanEnv(process.env, {
  DATABASE_URL: str({ default: '' }),
  PORT: num({ default: 3002 }),
  SERVICE_TOKEN: str({ default: '' }),
});

export default env;
