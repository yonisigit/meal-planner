import "dotenv/config"; // = dotenv.config()
import express from "express";
import cors from "cors";
import path from "path";

import { guestsRouter } from "./routes/guestsRoute.js";
import { config } from "./config/config.js"
import { authRouter } from "./routes/authRoute.js";


const app = express();
const __dirname = path.resolve();

app.use(express.json());

if (config.nodeEnv !== "production"){
  app.use(cors());
}

app.use("/api/auth", authRouter);
app.use("/api/guests", guestsRouter);

if (config.nodeEnv === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  // serve index.html for any GET request that is not an API call and does not request a file
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api')) return next();
    if (path.extname(req.path)) return next(); // likely a file request
    res.sendFile(path.join(distPath, 'index.html'));
  });
}


app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});