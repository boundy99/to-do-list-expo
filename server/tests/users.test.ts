import {describe, it, expect, beforeEach, vi} from "vitest";
import request from "supertest";
import {Webhook} from "svix";
import app from "../index";

const {dbCalls} = vi.hoisted(() => ({
  dbCalls: {
    inserted: [] as Record<string, unknown>[],
    updated: [] as Record<string, unknown>[],
    shouldFail: false,
  },
}));

vi.mock("../database/connection", () => ({
  client: {},
  db: {
    insert: () => ({
      values: async (values: Record<string, unknown>) => {
        if (dbCalls.shouldFail) throw new Error("db down");
        dbCalls.inserted.push(values);
      },
    }),
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: async () => {
          if (dbCalls.shouldFail) throw new Error("db down");
          dbCalls.updated.push(values);
        },
      }),
    }),
  },
}));

const WEBHOOK_SECRET = `whsec_${Buffer.from("test-webhook-secret-0123456789").toString("base64")}`;
process.env.CLERK_WEBHOOK_SECRET = WEBHOOK_SECRET;

function signedHeaders(payload: string) {
  const msgId = `msg_${Math.random().toString(36).slice(2)}`;
  const timestamp = new Date();
  const signature = new Webhook(WEBHOOK_SECRET).sign(
    msgId,
    timestamp,
    payload,
  );
  return {
    "svix-id": msgId,
    "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
    "svix-signature": signature,
    "Content-Type": "application/json",
  };
}

function sendWebhook(payload: object) {
  const body = JSON.stringify(payload);
  return request(app)
    .post("/webhooks/clerk")
    .set(signedHeaders(body))
    .send(body);
}

const userCreatedEvent = {
  type: "user.created",
  data: {
    id: "clerk_alice",
    email_addresses: [{email_address: "alice@test.local"}],
    first_name: "Alice",
    last_name: "Smith",
    username: "alice",
  },
};

beforeEach(() => {
  dbCalls.inserted = [];
  dbCalls.updated = [];
  dbCalls.shouldFail = false;
});

describe("clerk webhook: users", () => {
  it("creates a user on user.created", async () => {
    const res = await sendWebhook(userCreatedEvent);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({success: true, message: "User created"});
    expect(dbCalls.inserted).toEqual([
      {
        clerkId: "clerk_alice",
        email: "alice@test.local",
        firstName: "Alice",
        lastName: "Smith",
        username: "alice",
      },
    ]);
  });

  it("rejects user.created without an email", async () => {
    const res = await sendWebhook({
      type: "user.created",
      data: {id: "clerk_alice", email_addresses: []},
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({error: "No email found"});
    expect(dbCalls.inserted).toEqual([]);
  });

  it("updates a user on user.updated", async () => {
    const res = await sendWebhook({
      ...userCreatedEvent,
      type: "user.updated",
      data: {...userCreatedEvent.data, first_name: "Alicia"},
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({success: true, message: "User updated"});
    expect(dbCalls.updated).toEqual([
      {
        email: "alice@test.local",
        firstName: "Alicia",
        lastName: "Smith",
        username: "alice",
      },
    ]);
  });

  it("acknowledges other event types without touching the database", async () => {
    const res = await sendWebhook({type: "session.created", data: {}});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({success: true, message: "Event received"});
    expect(dbCalls.inserted).toEqual([]);
    expect(dbCalls.updated).toEqual([]);
  });

  it("rejects an unsigned request", async () => {
    const res = await request(app)
      .post("/webhooks/clerk")
      .set("Content-Type", "application/json")
      .send(JSON.stringify(userCreatedEvent));

    expect(res.status).toBe(401);
    expect(res.body).toEqual({error: "Unauthorized"});
    expect(dbCalls.inserted).toEqual([]);
  });

  it("rejects a request signed with the wrong secret", async () => {
    const body = JSON.stringify(userCreatedEvent);
    const wrongSecret = `whsec_${Buffer.from("wrong-secret-wrong-secret-1234").toString("base64")}`;
    const timestamp = new Date();
    const signature = new Webhook(wrongSecret).sign("msg_1", timestamp, body);

    const res = await request(app)
      .post("/webhooks/clerk")
      .set({
        "svix-id": "msg_1",
        "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
        "svix-signature": signature,
        "Content-Type": "application/json",
      })
      .send(body);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({error: "Unauthorized"});
    expect(dbCalls.inserted).toEqual([]);
  });

  it("returns 500 when the webhook secret is not configured", async () => {
    const saved = process.env.CLERK_WEBHOOK_SECRET;
    delete process.env.CLERK_WEBHOOK_SECRET;
    try {
      const res = await sendWebhook(userCreatedEvent);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({error: "Webhook secret not configured"});
    } finally {
      process.env.CLERK_WEBHOOK_SECRET = saved;
    }
  });

  it("returns a JSON 500 when the database fails", async () => {
    dbCalls.shouldFail = true;

    const res = await sendWebhook(userCreatedEvent);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({error: "Internal server error"});
  });
});
