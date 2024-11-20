import { and, eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";

export const getWorkspaceUser = async (
    workspaceId: string,
    userId: string,
) => {
    return await db.select()
        .from(schemas.workspaceUser).where(
            and(
                eq(schemas.workspaceUser.userId, userId),
                eq(schemas.workspaceUser.workspaceId, workspaceId),
            ),
        ).limit(1);
};
