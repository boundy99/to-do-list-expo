import {describe, it, expect, beforeEach, vi} from "vitest";
import request from "supertest";
import * as jwt from "jsonwebtoken";
import app from "../index";
import {withUserContext} from "../database/rls";

const {userLookup} = vi.hoisted(() => ({
  userLookup: {rows: [] as unknown[]},
}));

// validate-user looks the user up via db.select().from().where().limit()
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
  mockWithUserContext.mockReset();
});

describe("users", () => {
  it("rejects a valid JWT whose user does not exist", async () => {
    userLookup.rows = [];
    const token = jwt.sign({sub: "clerk_ghost"}, "test-secret");

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({error: "User not found"});
    expect(mockWithUserContext).not.toHaveBeenCalled();
  });

  it("authenticates a known user and queries with their id", async () => {
    mockWithUserContext.mockResolvedValue([]);

    const res = await request(app).get("/api/tasks").set(aliceHeaders);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect(mockWithUserContext).toHaveBeenCalledWith(
      alice.id,
      expect.any(Function),
    );
  });
});

describe("tasks", () => {
  it("creates a task for the authenticated user", async () => {
    mockWithUserContext.mockResolvedValue([sampleTask]);

    const res = await request(app)
      .post("/api/tasks")
      .set(aliceHeaders)
      .send({title: "Buy milk", description: "2 liters"});

    expect(res.status).toBe(201);
    expect(res.body).toEqual(sampleTask);
    expect(mockWithUserContext).toHaveBeenCalledWith(
      alice.id,
      expect.any(Function),
    );
  });

  it("rejects a task without a title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set(aliceHeaders)
      .send({description: "no title"});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({error: "Title is required"});
    expect(mockWithUserContext).not.toHaveBeenCalled();
  });

  it("lists the user's tasks", async () => {
    const other = {...sampleTask, id: 11, title: "Walk dog"};
    mockWithUserContext.mockResolvedValue([sampleTask, other]);

    const res = await request(app).get("/api/tasks").set(aliceHeaders);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([sampleTask, other]);
  });

  it("fetches a single task by id", async () => {
    mockWithUserContext.mockResolvedValue([sampleTask]);

    const res = await request(app)
      .get(`/api/tasks/${sampleTask.id}`)
      .set(aliceHeaders);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sampleTask);
  });

  it("returns 404 for a task the user does not own", async () => {
    mockWithUserContext.mockResolvedValue([]);

    const res = await request(app).get("/api/tasks/999").set(aliceHeaders);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({error: "Task not found"});
  });

  it("updates a task", async () => {
    const updated = {...sampleTask, title: "Updated", completed: true};
    mockWithUserContext.mockResolvedValue([updated]);

    const res = await request(app)
      .put(`/api/tasks/${sampleTask.id}`)
      .set(aliceHeaders)
      .send({title: "Updated", completed: true});

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
  });

  it("returns 404 when updating a task the user does not own", async () => {
    mockWithUserContext.mockResolvedValue([]);

    const res = await request(app)
      .put("/api/tasks/999")
      .set(aliceHeaders)
      .send({completed: true});

    expect(res.status).toBe(404);
    expect(res.body).toEqual({error: "Task not found"});
  });

  it("deletes a task", async () => {
    mockWithUserContext.mockResolvedValue([sampleTask]);

    const res = await request(app)
      .delete(`/api/tasks/${sampleTask.id}`)
      .set(aliceHeaders);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({message: "Task deleted successfully"});
  });

  it("returns 404 when deleting a task the user does not own", async () => {
    mockWithUserContext.mockResolvedValue([]);

    const res = await request(app).delete("/api/tasks/999").set(aliceHeaders);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({error: "Task not found"});
  });

  it("returns a JSON 500 when the database fails", async () => {
    mockWithUserContext.mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/tasks").set(aliceHeaders);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({error: "Failed to fetch tasks"});
  });
});
