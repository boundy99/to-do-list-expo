import {eq} from "drizzle-orm";
import {db} from "../database/connection";
import {users} from "../database/schema";

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}

export async function findUserByClerkId(clerkId: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertUser(clerkId: string, profile: UserProfile) {
  await db.insert(users).values({clerkId, ...profile});
}

export async function updateUserByClerkId(
  clerkId: string,
  profile: UserProfile,
) {
  await db.update(users).set(profile).where(eq(users.clerkId, clerkId));
}
