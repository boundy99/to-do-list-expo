import {sql} from "drizzle-orm";
import {db} from "./connection";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function withUserContext<T>(
  userId: number,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.user_id', ${String(userId)}, true)`,
    );
    await tx.execute(sql`set local role authenticated`);
    return fn(tx);
  });
}
