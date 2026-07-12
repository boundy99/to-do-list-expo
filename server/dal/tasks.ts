import {and, eq} from "drizzle-orm";
import {tasks} from "../database/schema";
import {withUserContext} from "../database/rls";

export interface NewTask {
  title: string;
  description?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

export async function insertTask(userId: number, data: NewTask) {
  const rows = await withUserContext(userId, (tx) =>
    tx
      .insert(tasks)
      .values({
        userId,
        title: data.title,
        description: data.description ?? null,
      })
      .returning(),
  );
  return rows[0];
}

export async function findTasksByUser(userId: number) {
  return withUserContext(userId, (tx) =>
    tx.select().from(tasks).where(eq(tasks.userId, userId)),
  );
}

export async function findTaskById(userId: number, taskId: number) {
  const rows = await withUserContext(userId, (tx) =>
    tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1),
  );
  return rows[0] ?? null;
}

export async function updateTaskById(
  userId: number,
  taskId: number,
  data: TaskUpdate,
) {
  const rows = await withUserContext(userId, (tx) =>
    tx
      .update(tasks)
      .set({
        title: data.title || undefined,
        description: data.description || undefined,
        completed: data.completed !== undefined ? data.completed : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning(),
  );
  return rows[0] ?? null;
}

export async function deleteTaskById(userId: number, taskId: number) {
  const rows = await withUserContext(userId, (tx) =>
    tx
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning(),
  );
  return rows[0] ?? null;
}
