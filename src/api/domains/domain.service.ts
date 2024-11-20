import db from "@/database/database";
import schemas from "@/database/schemas";

import { getWorkspaceUser } from "../workspace-users/workspace-users.service";
import { generateDnsKey } from "@/helpers/verify-dns-key";

type CreateDomainInput = {
    userId: string;
    workspaceId: string;
    domainName: string;
};

export const createDomainService = async (payload: CreateDomainInput) => {
    const { userId, workspaceId, domainName } = payload;

    const workspaceUser = await getWorkspaceUser(workspaceId, userId);
    if (!workspaceUser.length) {
        throw new Error("Workspace does not belong to user");
    }

    const [domainCreated] = await db.insert(schemas.domain).values({
        name: domainName,
        workspaceId,
        verificationKey: generateDnsKey(),
        verifcationStatus: "PENDING",
    }).returning();

    return domainCreated;
};
