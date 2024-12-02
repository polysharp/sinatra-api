import { and, eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { verifyPassword } from "@/helpers/hashpwd";
import { Forbidden, Unauthorized } from "@/helpers/HttpError";
import UserService from "../users/user.service";

export default abstract class WorkspaceService {
  /**
   * Creates a new workspace and assigns the given user as the workspace owner.
   * @param name {string} - The name of the new workspace.
   * @param userId {string} - The ID of the user creating the workspace.
   * @returns The newly created workspace.
   */
  static async createWorkspace(name: string, userId: string) {
    const [workspaceCreated] = await db
      .insert(schemas.workspace)
      .values({
        name,
      })
      .returning();

    await db.insert(schemas.workspaceUser).values({
      workspaceId: workspaceCreated.id,
      userId,
      role: "ADMIN",
      owner: true,
    });

    return workspaceCreated;
  }

  /**
   * Fetches a specific workspace for a user by workspace ID.
   * Ensures the workspace belongs to the user.
   * @param userId {string} - The ID of the user.
   * @param workspaceId {string} - The ID of the workspace to fetch.
   * @returns The workspace details, including role and ownership status.
   * @throws {Forbidden} - If the workspace does not belong to the user.
   */
  static async getUserWorkspaceById(userId: string, workspaceId: string) {
    const workspace = await db
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
      .where(
        and(
          eq(schemas.workspaceUser.userId, userId),
          eq(schemas.workspaceUser.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!workspace.length) {
      throw new Forbidden("Workspace does not belong to user");
    }

    return workspace[0];
  }

  /**
   * Updates a workspace's details if the user is the owner of the workspace.
   * @param userId {string} - The ID of the user.
   * @param workspaceId {string} - The ID of the workspace to update.
   * @param updateData {Partial<{ name: string }>} - The data to update in the workspace.
   * @returns The updated workspace details.
   * @throws {Forbidden} - If the workspace does not belong to the user and/or if the user is not the owner of the workspace.
   */
  static async updateWorkspace(
    userId: string,
    workspaceId: string,
    updateData: Partial<{ name: string }>,
  ) {
    const workspace = await WorkspaceService.getUserWorkspaceById(
      userId,
      workspaceId,
    );

    if (!workspace.owner) {
      throw new Forbidden("User is not the owner of the workspace");
    }

    const [updatedWorkspace] = await db
      .update(schemas.workspace)
      .set(updateData)
      .where(eq(schemas.workspace.id, workspace.id))
      .returning();

    return updatedWorkspace;
  }

  /**
   * Deletes a workspace if the user is the owner and confirms the action with the workspace name and password.
   * @param userId {string} - The ID of the user.
   * @param workspaceId {string} - The ID of the workspace to delete.
   * @param workspaceName {string} - The name of the workspace to confirm deletion.
   * @param password {string} - The password of the user for authentication.
   * @throws {Unauthorized} - If the credentials are incorrect.
   * @throws {Forbidden} - If the workspace does not belong to the user and/or if the user is not the owner of the workspace.
   */
  static async deleteWorkspace(
    userId: string,
    workspaceId: string,
    workspaceName: string,
    password: string,
  ) {
    const user = await UserService.getUser({ id: userId }, true);

    await verifyPassword(password, user.password);

    const workspace = await WorkspaceService.getUserWorkspaceById(
      userId,
      workspaceId,
    );

    if (!workspace.owner || workspace.name !== workspaceName) {
      throw new Forbidden(
        "User is not the owner of the workspace or workspace name does not match",
      );
    }

    await db.transaction(async (trx) => {
      await trx
        .delete(schemas.site)
        .where(eq(schemas.site.workspaceId, workspaceId));
      await trx
        .delete(schemas.apiKey)
        .where(eq(schemas.apiKey.workspaceId, workspaceId));
      await trx
        .delete(schemas.domain)
        .where(eq(schemas.domain.workspaceId, workspaceId));
      await trx
        .delete(schemas.workspaceUser)
        .where(eq(schemas.workspaceUser.workspaceId, workspaceId));
      await trx
        .delete(schemas.workspace)
        .where(eq(schemas.workspace.id, workspaceId));
    });
  }
}
