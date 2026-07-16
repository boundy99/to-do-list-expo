import "dotenv/config";
import {describe, it, expect, vi} from "vitest";
import request from "supertest";
import {verifyToken} from "@clerk/backend";
import app from "../index";

vi.mock("@clerk/backend", () => ({
  verifyToken: vi.fn(async () => {
    throw new Error("Token verification failed");
  }),
}));

process.env.CLERK_SECRET_KEY = "test-secret-key";

const mockVerifyToken = vi.mocked(verifyToken);

describe("error responses", () => {
  it("returns JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/nope");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({error: "Not found"});
  });

  it("returns JSON 400 for malformed JSON bodies", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Content-Type", "application/json")
      .send('{"title": broken');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({error: "Invalid JSON in request body"});
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/tasks");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({error: "Token required"});
  });

  it("returns 401 for a token that fails signature verification", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", "Bearer not-a-jwt");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({error: "Invalid token"});
  });

  it("returns 401 for an expired token without leaking the reason", async () => {
    mockVerifyToken.mockRejectedValueOnce(
      Object.assign(new Error("JWT is expired."), {reason: "token-expired"}),
    );

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", "Bearer expired-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({error: "Invalid token"});
  });
});

describe("root", () => {
  it("responds with a welcome message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({message: "Welcome"});
  });
});
