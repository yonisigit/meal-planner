import "dotenv/config"; // = dotenv.config()
import env from "./config/validateEnv.js";
import express from "express";
import cors from "cors";
import { guestsRouter } from "./routes/guestsRoute.js";


const port = env.PORT;

const app =  express();


app.use(express.json());
app.use(cors())

app.use("/api/guests", guestsRouter);



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});