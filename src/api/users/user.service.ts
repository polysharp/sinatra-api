import { eq, getTableColumns } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";

type WithoutPassword<T> = Omit<T, "password">;

export default abstract class UserService {
  /**
   * Fetches a user by email with or without the password field.
   * @param email {string} - The email address of the user.
   * @param withPassword {boolean} - Whether to include the password field in the result.
   * @returns {Promise<Object | null>} - The user record or null if not found.
   */
  static async getUserWithEmail<WithPassword extends boolean = false>(
    email: string,
    withPassword: WithPassword = false as WithPassword,
  ): Promise<
    WithPassword extends true
      ? typeof schemas.user.$inferSelect
      : WithoutPassword<typeof schemas.user.$inferSelect> | null
  > {
    let columns;
    if (!withPassword) {
      const { password, ...rest } = getTableColumns(schemas.user);
      columns = rest;
    } else {
      columns = getTableColumns(schemas.user);
    }

    const [userExists] = await db
      .select(columns)
      .from(schemas.user)
      .where(eq(schemas.user.email, email))
      .limit(1);

    return userExists ? (userExists as any) : null;
  }

  /**
   * Fetches all users from the database.
   * @returns A list of all user records.
   */
  static async getUsers() {
    const users = await db.select().from(schemas.user);

    return users;
  }
}
