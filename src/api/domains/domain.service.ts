import { eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { generateDnsKey } from "@/helpers/verify-dns-key";

import { getWorkspaceUser } from "../workspace-users/workspace-users.service";

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

  const [domainCreated] = await db
    .insert(schemas.domain)
    .values({
      name: domainName,
      workspaceId,
      verificationKey: generateDnsKey(),
      verifcationStatus: "PENDING",
    })
    .returning();

  return domainCreated;
};

export const getUserWorkspaceDomains = async (
  userId: string,
  workspaceId: string,
) => {
  const workspaceUser = await getWorkspaceUser(workspaceId, userId);
  if (!workspaceUser.length) {
    throw new Error("Workspace does not belong to user");
  }

  const domains = await db
    .select()
    .from(schemas.domain)
    .where(eq(schemas.domain.workspaceId, workspaceId));

  return domains;
};
