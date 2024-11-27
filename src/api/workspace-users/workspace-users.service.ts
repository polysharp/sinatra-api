import { and, eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { Forbidden } from "@/helpers/HttpError";

export const workspaceBelongsToUser = async (
  workspaceId: string,
  userId: string,
  errorMsg?: string,
) => {
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
    throw new Forbidden(errorMsg || "Workspace does not belong to user", {
      workspaceId,
      userId,
    });
  }
};

export const getUserWorkspaces = async (userId: string) => {
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
};
