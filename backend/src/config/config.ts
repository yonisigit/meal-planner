import env from "./validateEnv.js"

type Config = {
  port: number
  nodeEnv: string
};


export const config: Config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV
}