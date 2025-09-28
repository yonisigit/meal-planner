import "dotenv/config"; // = dotenv.config()
import env from "./config/validate_env.js";
import express from "express";

import { notesRouter } from "./api/notes.js";
import { testDB } from "./db/queries/guest_queries.js";


const app =  express();

const port = env.PORT;

await testDB();

app.use("/api/notes", notesRouter);

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});