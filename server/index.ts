import type {Request, Response, NextFunction} from "express";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import webhookRoutes from "./routes/webhooks";
import taskRoutes from "./routes/tasks";
import {limiter} from "./middlewares";

const app = express();
app.use(helmet());
app.use(limiter);
app.use(cors());
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

// 404 for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({error: "Not found"});
});

// global error handler (malformed JSON, uncaught route errors)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({error: "Invalid JSON in request body"});
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({error: "Internal server error"});
});

export default app;
