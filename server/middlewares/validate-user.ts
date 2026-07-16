import {Request, Response, NextFunction} from "express";
import {verifyToken} from "@clerk/backend";
import {findUserByClerkId} from "../dal";
import "../types";

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

  if (!token) {
    return res.status(401).json({error: "Token required"});
  }

  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({error: "Clerk secret key not configured"});
  }

  const authorizedParties = process.env.CLERK_AUTHORIZED_PARTIES
    ? process.env.CLERK_AUTHORIZED_PARTIES.split(",")
        .map((party) => party.trim())
        .filter(Boolean)
    : undefined;

  try {
    const payload = await verifyToken(token, {secretKey, authorizedParties});

    const user = await findUserByClerkId(payload.sub);

    if (user) {
      req.user = user;
      req.body = restBody;
      next();
    } else {
      return res.status(401).json({error: "User not found"});
    }
  } catch (err) {
    return res.status(401).json({error: "Invalid token"});
  }
}
