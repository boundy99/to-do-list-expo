import {Request, Response, NextFunction} from "express";
import * as jwt from "jsonwebtoken";
import {db} from "../database/connection";
import {users} from "../database/schema";
import {eq} from "drizzle-orm";
import "../types";

interface JwtPayload {
  sub?: string;
  id?: string;
  [key: string]: any;
}

export async function validateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let token = req.body?.user;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  const restBody = req.body || {};

  try {
    if (!token) {
      return res.status(401).json({error: "Token required"});
    }

    const payload = jwt.decode(token) as JwtPayload;

    if (!payload) {
      return res.status(401).json({error: "Invalid token"});
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.exp) {
      if (now > payload.exp) {
        return res.status(401).json({error: "Token expired"});
      }
    }

    const clerkId = payload.sub || payload.id;

    if (!clerkId) {
      return res.status(401).json({error: "Invalid token structure"});
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (user.length > 0) {
      req.user = user[0];
      req.body = restBody;
      next();
    } else {
      return res.status(401).json({error: "User not found"});
    }
  } catch (err) {
    return res.status(401).json({error: "Invalid token"});
  }
}
