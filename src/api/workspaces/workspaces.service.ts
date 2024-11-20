import { eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";

export const createWorkspace = async (name: string, userId: string) => {
    const [workspaceCreated] = await db.insert(schemas.workspace).values({
        name,
    }).returning();

    await db.insert(schemas.workspaceUser).values({
        workspaceId: workspaceCreated.id,
        userId,
        role: "ADMIN",
        owner: true,
    });

    return workspaceCreated;
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

    return userWorkspaces.length ? userWorkspaces : null;
};
