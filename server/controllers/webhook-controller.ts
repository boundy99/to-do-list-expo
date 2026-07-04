import {Request, Response} from "express";
import {eq} from "drizzle-orm";
import {db} from "../database/connection";
import {users} from "../database/schema";

export async function handleClerkWebhook(req: Request, res: Response) {
  try {
    const event = req.body;
    const eventType = event.type;

    if (eventType === "user.created") {
      const {id, email_addresses, first_name, last_name, username} = event.data;

      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return res.status(400).json({error: "No email found"});
      }

      await db.insert(users).values({
        clerkId: id,
        email: primaryEmail,
        firstName: first_name || "",
        lastName: last_name || "",
        username: username || "",
      });

      return res.json({success: true, message: "User created"});
    }

    if (eventType === "user.updated") {
      const {id, email_addresses, first_name, last_name, username} = event.data;

      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return res.status(400).json({error: "No email found"});
      }

      await db
        .update(users)
        .set({
          email: primaryEmail,
          firstName: first_name || "",
          lastName: last_name || "",
          username: username || "",
        })
        .where(eq(users.clerkId, id));

      return res.json({success: true, message: "User updated"});
    }

    return res.json({success: true, message: "Event received"});
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
}
