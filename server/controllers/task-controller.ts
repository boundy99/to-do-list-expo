import {Request, Response} from "express";
import {db} from "../database/connection";
import {tasks} from "../database/schema";
import {eq} from "drizzle-orm";

export async function createTask(req: Request, res: Response) {
  try {
    const {userId, title, description} = req.body;

    if (!userId || !title) {
      return res.status(400).json({error: "userId and title are required"});
    }

    const newTask = await db
      .insert(tasks)
      .values({
        userId,
        title,
        description: description || null,
      })
      .returning();

    return res.status(201).json(newTask[0]);
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({error: "Failed to create task"});
  }
}

export async function getTasks(req: Request, res: Response) {
  try {
    const {userId} = req.query;

    if (!userId) {
      return res.status(400).json({error: "userId is required"});
    }

    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, Number(userId)));

    return res.json(userTasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({error: "Failed to fetch tasks"});
  }
}

export async function getTask(req: Request, res: Response) {
  try {
    const {id} = req.params;

    const task = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, Number(id)))
      .limit(1);

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

    const updatedTask = await db
      .update(tasks)
      .set({
        title: title || undefined,
        description: description || undefined,
        completed: completed !== undefined ? completed : undefined,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, Number(id)))
      .returning();

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

    const deletedTask = await db
      .delete(tasks)
      .where(eq(tasks.id, Number(id)))
      .returning();

    if (deletedTask.length === 0) {
      return res.status(404).json({error: "Task not found"});
    }

    return res.json({message: "Task deleted successfully"});
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({error: "Failed to delete task"});
  }
}
