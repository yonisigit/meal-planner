import { cleanEnv, port, str } from "envalid";

export default cleanEnv(process.env, {
  TURSO_DATABASE_URL: str(),
  TURSO_AUTH_TOKEN: str(),
  PORT: port()
});