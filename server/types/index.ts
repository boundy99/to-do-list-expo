import type {InferSelectModel} from "drizzle-orm";
import {users} from "../database/schema";

export type User = InferSelectModel<typeof users>;

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
