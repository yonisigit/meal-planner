import express from "express";

export const notesRouter = express.Router();

notesRouter.get("/", (req, res) => {
  res.send("hi from notes");
});

