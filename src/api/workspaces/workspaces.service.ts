import { eq } from "drizzle-orm";

import db from "../../database/database";
import schemas from "../../database/schemas";

export const createWorkspaceService = async (name: string, userId: string) => {
    const [{ id: workspaceId }] = await db.insert(schemas.workspace).values({
        name,
    }).returning({ id: schemas.workspace.id });

    await db.insert(schemas.workspaceUser).values({
        workspaceId,
        userId,
        role: "ADMIN",
        owner: true,
    });

    return { id: workspaceId, name };
};

export const getWorkspacesWithEmail = async (userId: string) => {
    const userWorkspaces = await db
        .select({
            workspaceId: schemas.workspace.id,
            workspaceName: schemas.workspace.name,
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

    return userWorkspaces.length ? userWorkspaces : null;
};
