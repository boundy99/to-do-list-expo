import "dotenv/config";
import {describe, it, expect} from "vitest";
import request from "supertest";
import app from "../index";

describe("rate limiting", () => {
  it("sets RateLimit headers on responses", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.headers["ratelimit"]).toBeDefined();
    expect(res.headers["ratelimit-policy"]).toBe("100;w=900");
  });

  it("returns 429 once the limit is exceeded", async () => {
    for (let i = 0; i < 99; i++) {
      const res = await request(app).get("/");
      expect(res.status).toBe(200);
    }

    const res = await request(app).get("/");

    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      error: "Too many requests, please try again later",
    });
  });
});
