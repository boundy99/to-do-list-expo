import {Router} from "express";
import {Webhook} from "svix";
import {handleClerkWebhook} from "../controllers/webhook-controller";

const router = Router();

router.post("/clerk", async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({error: "Webhook secret not configured"});
  }

  try {
    const svix = new Webhook(WEBHOOK_SECRET);

    const body =
      req.body instanceof Buffer
        ? req.body.toString()
        : JSON.stringify(req.body);

    svix.verify(body, {
      "svix-id": req.headers["svix-id"] as string,
      "svix-timestamp": req.headers["svix-timestamp"] as string,
      "svix-signature": req.headers["svix-signature"] as string,
    });

    const event = JSON.parse(body);
    req.body = event;

    return handleClerkWebhook(req, res);
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return res.status(401).json({error: "Unauthorized"});
  }
});

export default router;
