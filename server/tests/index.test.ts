import "dotenv/config";
import {describe, it, expect} from "vitest";
import request from "supertest";
import * as jwt from "jsonwebtoken";
import app from "../index";

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

  it("returns 401 for a token that is not a JWT", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", "Bearer not-a-jwt");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({error: "Invalid token"});
  });

  it("returns 401 for an expired token", async () => {
    const expiredToken = jwt.sign({sub: "user_test"}, "test-secret", {
      expiresIn: -60,
    });

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({error: "Token expired"});
  });
});

describe("root", () => {
  it("responds with a welcome message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({message: "Welcome"});
  });
});
