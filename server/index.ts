import type {Request, Response, NextFunction} from "express";
import webhookRoutes from "./routes/webhooks";
import taskRoutes from "./routes/tasks";

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

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

// webhooks
app.use("/webhooks", express.raw({type: "application/json"}), webhookRoutes);

// routes
app.use("/api/tasks", taskRoutes);

module.exports = app;
