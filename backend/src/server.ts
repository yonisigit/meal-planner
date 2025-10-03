import "dotenv/config"; // = dotenv.config()
import express from "express";
import cors from "cors";
import path from "path";

import { guestsRouter } from "./api/routes/guestsRoute.js";
import { config } from "./config/config.js"
import { authRouter } from "./api/routes/authRoute.js";
import { dishesRouter } from "./api/routes/dishesRoute.js";


const app = express();
const __dirname = path.resolve();

app.use(express.json());

if (!config.isProd){
  app.use(cors());
}

app.use("/api/auth", authRouter);
app.use("/api/guests", guestsRouter);
app.use("/api/dishes", dishesRouter);

if (config.isProd) {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  // serve index.html for any GET request that is not an API call and does not request a file
  //FIX THIS
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api')) return next();
    if (path.extname(req.path)) return next(); // likely a file request
    res.sendFile(path.join(distPath, 'index.html'));
  });
}


app.listen(config.port, () => {
  console.log(`Server running on PORT:${config.port}`);
});