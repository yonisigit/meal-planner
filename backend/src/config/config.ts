import env from "./validateEnv.js"

//IN SECONDS!!!
const DEFAULT_JWT_EXPIRY = 15 * 60; // 15 minutes in seconds
const DEFAULT_JWT_REFRESH_EXPIRY = 12 * 60 * 60; // 12 hours in seconds


type JWTConfig = {
  defaultExpiry: number;
  refreshExpiry: number;
  secret: string;
  issuer: string;
}

type Config = {
  port: number;
  isProd: boolean;
  jwt: JWTConfig;
};

function checkProd(){
  if (env.NODE_ENV === "production"){
    return true;
  }
  return false;
}

export const config: Config = {
  port: env.PORT,
  isProd: checkProd(),
  jwt: {
    defaultExpiry: DEFAULT_JWT_EXPIRY,
    refreshExpiry: DEFAULT_JWT_REFRESH_EXPIRY,
    secret: env.ACCESS_TOKEN_SECRET!,
    issuer: env.JWT_ISSUER!
  }
};