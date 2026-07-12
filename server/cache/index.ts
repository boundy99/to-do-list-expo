import Redis from "ioredis";
import chalk from "chalk";

const DEFAULT_TTL_SECONDS = 60;

export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    })
  : null;

if (redis) {
  let errorLogged = false;
  redis.on("error", (error) => {
    if (!errorLogged) {
      errorLogged = true;
      console.error(
        chalk.red("Redis error (caching disabled until reconnect):"),
        error.message,
      );
    }
  });
  redis.on("ready", () => {
    errorLogged = false;
    console.log(chalk.green("Redis connected successfully"));
  });
}

export function tasksListKey(userId: number) {
  return `user:${userId}:tasks`;
}

export function taskKey(userId: number, taskId: number) {
  return `user:${userId}:task:${taskId}`;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = DEFAULT_TTL_SECONDS,
) {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {}
}

export async function cacheDel(...keys: string[]) {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {}
}
