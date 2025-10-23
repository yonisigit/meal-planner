import { cleanEnv, port, str } from "envalid";

export default cleanEnv(process.env, {
  TURSO_DATABASE_URL: str(),
  TURSO_AUTH_TOKEN: str(),
  ACCESS_TOKEN_SECRET: str(),
  JWT_ISSUER: str(),
  NODE_ENV: str(),
  PORT: port()
});