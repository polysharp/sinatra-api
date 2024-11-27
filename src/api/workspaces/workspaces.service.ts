import { and, eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { Forbidden } from "@/helpers/HttpError";

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
}
