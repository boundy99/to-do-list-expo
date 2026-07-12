import {describe, it, expect, beforeEach, afterAll, vi} from "vitest";
import request from "supertest";
import * as jwt from "jsonwebtoken";

const {userLookup, store} = vi.hoisted(() => {
  process.env.REDIS_URL = "redis://cache-test";
  return {
    userLookup: {rows: [] as unknown[]},
    store: new Map<string, string>(),
  };
});

vi.mock("ioredis", () => ({
  default: class FakeRedis {
    on() {}
    async get(key: string) {
      return store.get(key) ?? null;
    }
    async set(key: string, value: string) {
      store.set(key, value);
      return "OK";
    }
    async del(...keys: string[]) {
      let removed = 0;
      for (const key of keys) {
        if (store.delete(key)) removed++;
      }
      return removed;
    }
  },
}));

vi.mock("../database/connection", () => ({
  client: {},
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => userLookup.rows,
        }),
      }),
    }),
  },
}));

vi.mock("../database/rls", () => ({
  withUserContext: vi.fn(),
}));

import app from "../index";
import {withUserContext} from "../database/rls";

const mockWithUserContext = vi.mocked(withUserContext);

const alice = {
  id: 1,
  clerkId: "clerk_alice",
  firstName: "Alice",
  lastName: null,
  email: "alice@test.local",
  username: null,
};

const aliceHeaders = {
  Authorization: `Bearer ${jwt.sign({sub: alice.clerkId}, "test-secret")}`,
};

const sampleTask = {
  id: 10,
  userId: alice.id,
  title: "Buy milk",
  description: "2 liters",
  completed: false,
  createdAt: "2026-07-11T10:00:00.000Z",
  updatedAt: "2026-07-11T10:00:00.000Z",
};

beforeEach(() => {
  userLookup.rows = [alice];
  store.clear();
  mockWithUserContext.mockReset();
});

afterAll(() => {
  delete process.env.REDIS_URL;
});

describe("task caching", () => {
  it("serves the task list from cache on the second request", async () => {
    mockWithUserContext.mockResolvedValue([sampleTask]);

    const first = await request(app).get("/api/tasks").set(aliceHeaders);
    expect(first.status).toBe(200);
    expect(mockWithUserContext).toHaveBeenCalledTimes(1);

    const second = await request(app).get("/api/tasks").set(aliceHeaders);
    expect(second.status).toBe(200);
    expect(second.body).toEqual([sampleTask]);
    expect(mockWithUserContext).toHaveBeenCalledTimes(1);
  });

  it("serves a single task from cache on the second request", async () => {
    mockWithUserContext.mockResolvedValue([sampleTask]);

    await request(app).get(`/api/tasks/${sampleTask.id}`).set(aliceHeaders);
    const second = await request(app)
      .get(`/api/tasks/${sampleTask.id}`)
      .set(aliceHeaders);

    expect(second.status).toBe(200);
    expect(second.body).toEqual(sampleTask);
    expect(mockWithUserContext).toHaveBeenCalledTimes(1);
  });

  it("invalidates the list cache when a task is created", async () => {
    mockWithUserContext.mockResolvedValue([sampleTask]);
    await request(app).get("/api/tasks").set(aliceHeaders);

    await request(app)
      .post("/api/tasks")
      .set(aliceHeaders)
      .send({title: "Walk dog"});

    await request(app).get("/api/tasks").set(aliceHeaders);
    expect(mockWithUserContext).toHaveBeenCalledTimes(3);
  });

  it("invalidates list and task caches when a task is updated", async () => {
    mockWithUserContext.mockResolvedValue([sampleTask]);
    await request(app).get("/api/tasks").set(aliceHeaders);
    await request(app).get(`/api/tasks/${sampleTask.id}`).set(aliceHeaders);

    await request(app)
      .put(`/api/tasks/${sampleTask.id}`)
      .set(aliceHeaders)
      .send({completed: true});

    await request(app).get("/api/tasks").set(aliceHeaders);
    await request(app).get(`/api/tasks/${sampleTask.id}`).set(aliceHeaders);
    expect(mockWithUserContext).toHaveBeenCalledTimes(5);
  });

  it("invalidates list and task caches when a task is deleted", async () => {
    mockWithUserContext.mockResolvedValue([sampleTask]);
    await request(app).get(`/api/tasks/${sampleTask.id}`).set(aliceHeaders);

    await request(app).delete(`/api/tasks/${sampleTask.id}`).set(aliceHeaders);

    await request(app).get(`/api/tasks/${sampleTask.id}`).set(aliceHeaders);
    expect(mockWithUserContext).toHaveBeenCalledTimes(3);
  });

  it("does not leak one user's cache to another user", async () => {
    const bob = {...alice, id: 2, clerkId: "clerk_bob"};
    const bobHeaders = {
      Authorization: `Bearer ${jwt.sign({sub: bob.clerkId}, "test-secret")}`,
    };

    mockWithUserContext.mockResolvedValue([sampleTask]);
    await request(app).get("/api/tasks").set(aliceHeaders);

    userLookup.rows = [bob];
    mockWithUserContext.mockResolvedValue([]);
    const res = await request(app).get("/api/tasks").set(bobHeaders);

    expect(res.body).toEqual([]);
    expect(mockWithUserContext).toHaveBeenCalledTimes(2);
  });
});
