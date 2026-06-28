import type {Request, Response, NextFunction} from "express";

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// const exampleRoutes = require("./routes/exampleRoutes");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.path, req.method);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.json({message: "Welcome"});
});

//routes
// app.use("/api/examples", exampleRoutes);

module.exports = app;
