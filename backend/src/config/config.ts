import env from "./validateEnv.js"

type Config = {
  port: number
  isProd: boolean
};

function checkProd(){
  if (env.NODE_ENV === "production"){
    return true;
  }
  return false;
}

export const config: Config = {
  port: env.PORT,
  isProd: checkProd()
}