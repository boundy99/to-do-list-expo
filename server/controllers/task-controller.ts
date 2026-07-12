import {Request, Response} from "express";
import {
  insertTask,
  findTasksByUser,
  findTaskById,
  updateTaskById,
  deleteTaskById,
} from "../dal";
import {
  cacheGet,
  cacheSet,
  cacheDel,
  tasksListKey,
  taskKey,
} from "../cache";
import "../types";
import type {Task} from "../database/schema";

export async function createTask(req: Request, res: Response) {
  try {
    const {title, description} = req.body;

    if (!title) {
      return res.status(400).json({error: "Title is required"});
    }

    if (!req.user) {
      return res.status(401).json({error: "User not found"});
    }

    const newTask = await insertTask(req.user.id, {title, description});

    await cacheDel(tasksListKey(req.user.id));

    return res.status(201).json(newTask);
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

    const cached = await cacheGet<Task[]>(tasksListKey(req.user.id));
    if (cached) {
      return res.json(cached);
    }

    const userTasks = await findTasksByUser(req.user.id);

    await cacheSet(tasksListKey(req.user.id), userTasks);

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

    const cached = await cacheGet<Task>(taskKey(req.user.id, Number(id)));
    if (cached) {
      return res.json(cached);
    }

    const task = await findTaskById(req.user.id, Number(id));

    if (!task) {
      return res.status(404).json({error: "Task not found"});
    }

    await cacheSet(taskKey(req.user.id, Number(id)), task);

    return res.json(task);
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

    const updatedTask = await updateTaskById(req.user.id, Number(id), {
      title,
      description,
      completed,
    });

    if (!updatedTask) {
      return res.status(404).json({error: "Task not found"});
    }

    await cacheDel(
      tasksListKey(req.user.id),
      taskKey(req.user.id, Number(id)),
    );

    return res.json(updatedTask);
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

    const deletedTask = await deleteTaskById(req.user.id, Number(id));

    if (!deletedTask) {
      return res.status(404).json({error: "Task not found"});
    }

    await cacheDel(
      tasksListKey(req.user.id),
      taskKey(req.user.id, Number(id)),
    );

    return res.json({message: "Task deleted successfully"});
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({error: "Failed to delete task"});
  }
}
