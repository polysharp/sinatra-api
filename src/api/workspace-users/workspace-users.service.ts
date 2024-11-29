import { and, eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { Forbidden } from "@/helpers/HttpError";

export default abstract class WorkspaceUserService {
  /**
   * Checks if a workspace belongs to a specific user.
   * @param workspaceId {string} - The ID of the workspace.
   * @param userId {string} - The ID of the user.
   * @throws {Forbidden} - If the workspace does not belong to the user.
   */
  static async workspaceBelongsToUser(workspaceId: string, userId: string) {
    const workspaceUser = await db
      .select()
      .from(schemas.workspaceUser)
      .where(
        and(
          eq(schemas.workspaceUser.userId, userId),
          eq(schemas.workspaceUser.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!workspaceUser.length) {
      throw new Forbidden("Workspace does not belong to user", {
        workspaceId,
        userId,
      });
    }
  }

  /**
   * Retrieves all workspaces associated with a user.
   * @param userId {string} - The ID of the user.
   * @returns A list of workspaces with role and ownership details.
   */
  static async getUserWorkspaces(userId: string) {
    const userWorkspaces = await db
      .select({
        id: schemas.workspace.id,
        name: schemas.workspace.name,
        createdAt: schemas.workspace.createdAt,
        updatedAt: schemas.workspace.updatedAt,
        role: schemas.workspaceUser.role,
        owner: schemas.workspaceUser.owner,
      })
      .from(schemas.workspaceUser)
      .innerJoin(
        schemas.workspace,
        eq(schemas.workspaceUser.workspaceId, schemas.workspace.id),
      )
      .where(eq(schemas.workspaceUser.userId, userId));

    return userWorkspaces.length ? userWorkspaces : [];
  }

  /**
   * Retrieves the role of a user in a specific workspace.
   * @param workspaceId {string} - The ID of the workspace.
   * @param userId {string} - The ID of the user.
   * @returns The role of the user in the workspace.
   * @throws {Forbidden} - If the user does not belong to the workspace.
   */
  static async getUserRoleInWorkspace(workspaceId: string, userId: string) {
    const workspaceUser = await db
      .select({
        role: schemas.workspaceUser.role,
      })
      .from(schemas.workspaceUser)
      .where(
        and(
          eq(schemas.workspaceUser.userId, userId),
          eq(schemas.workspaceUser.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!workspaceUser.length) {
      throw new Forbidden("User does not belong to the workspace", {
        workspaceId,
        userId,
      });
    }

    return workspaceUser[0].role;
  }
}
