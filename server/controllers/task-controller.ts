import {Request, Response} from "express";
import {tasks} from "../database/schema";
import {withUserContext} from "../database/rls";
import {and, eq} from "drizzle-orm";
import "../types";

export async function createTask(req: Request, res: Response) {
  try {
    const {title, description} = req.body;

    if (!title) {
      return res.status(400).json({error: "Title is required"});
    }

    if (!req.user) {
      return res.status(401).json({error: "User not found"});
    }

    const userId = req.user.id;

    const newTask = await withUserContext(userId, (tx) =>
      tx
        .insert(tasks)
        .values({
          userId,
          title,
          description: description || null,
        })
        .returning(),
    );

    return res.status(201).json(newTask[0]);
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({error: "Failed to create task"});
  }
}

export async function getTasks(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({error: "User not found"});
    }

    const userId = req.user.id;

    const userTasks = await withUserContext(userId, (tx) =>
      tx.select().from(tasks).where(eq(tasks.userId, userId)),
    );

    return res.json(userTasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({error: "Failed to fetch tasks"});
  }
}

export async function getTask(req: Request, res: Response) {
  try {
    const {id} = req.params;

    if (!req.user) {
      return res.status(401).json({error: "User not found"});
    }

    const userId = req.user.id;

    const task = await withUserContext(userId, (tx) =>
      tx
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, Number(id)), eq(tasks.userId, userId)))
        .limit(1),
    );

    if (task.length === 0) {
      return res.status(404).json({error: "Task not found"});
    }

    return res.json(task[0]);
  } catch (error) {
    console.error("Get task error:", error);
    return res.status(500).json({error: "Failed to fetch task"});
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    const {id} = req.params;
    const {title, description, completed} = req.body;

    if (!req.user) {
      return res.status(401).json({error: "User not found"});
    }

    const userId = req.user.id;

    const updatedTask = await withUserContext(userId, (tx) =>
      tx
        .update(tasks)
        .set({
          title: title || undefined,
          description: description || undefined,
          completed: completed !== undefined ? completed : undefined,
          updatedAt: new Date(),
        })
        .where(and(eq(tasks.id, Number(id)), eq(tasks.userId, userId)))
        .returning(),
    );

    if (updatedTask.length === 0) {
      return res.status(404).json({error: "Task not found"});
    }

    return res.json(updatedTask[0]);
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({error: "Failed to update task"});
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
    const {id} = req.params;

    if (!req.user) {
      return res.status(401).json({error: "User not found"});
    }

    const userId = req.user.id;

    const deletedTask = await withUserContext(userId, (tx) =>
      tx
        .delete(tasks)
        .where(and(eq(tasks.id, Number(id)), eq(tasks.userId, userId)))
        .returning(),
    );

    if (deletedTask.length === 0) {
      return res.status(404).json({error: "Task not found"});
    }

    return res.json({message: "Task deleted successfully"});
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({error: "Failed to delete task"});
  }
}
