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
    const signature = req.headers["svix-signature"] as string;

    svix.verify(JSON.stringify(req.body), {
      "svix-signature": signature,
    });

    return handleClerkWebhook(req, res);
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return res.status(401).json({error: "Unauthorized"});
  }
});

export default router;
