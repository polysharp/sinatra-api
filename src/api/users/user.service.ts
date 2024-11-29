import { eq, getTableColumns } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";

import WorkspaceUserService from "../workspace-users/workspace-users.service";

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
   * Retrieves a list of users associated with a specific workspace.
   *
   * @param workspaceId - The ID of the workspace to retrieve users from.
   * @param userId - The ID of the user making the request.
   * @returns A promise that resolves to an array of users
   * @throws Will throw an error if the workspace does not belong to the user.
   */
  static async getUsers(workspaceId: string, userId: string) {
    await WorkspaceUserService.workspaceBelongsToUser(workspaceId, userId);

    const users = await db
      .select({
        id: schemas.user.id,
        email: schemas.user.email,
        createdAt: schemas.user.createdAt,
        role: schemas.workspaceUser.role,
        owner: schemas.workspaceUser.owner,
      })
      .from(schemas.user)
      .innerJoin(
        schemas.workspaceUser,
        eq(schemas.user.id, schemas.workspaceUser.userId),
      )
      .where(eq(schemas.workspaceUser.workspaceId, workspaceId));

    return users;
  }
}
