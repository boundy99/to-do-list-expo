import "dotenv/config";
import {describe, it, expect} from "vitest";
import request from "supertest";
import app from "../index";

describe("security headers", () => {
  it("sets helmet headers on responses", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.headers["content-security-policy"]).toBeDefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});
