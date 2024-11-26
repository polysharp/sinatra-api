import { eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { NotFound } from "@/helpers/HttpError";
import { generateDnsKey, verifyDnsKey } from "@/helpers/verify-dns-key";

import { workspaceBelongsToUser } from "../workspace-users/workspace-users.service";

type CreateDomainInput = {
  userId: string;
  workspaceId: string;
  domainName: string;
};

export const createDomainService = async (payload: CreateDomainInput) => {
  const { userId, workspaceId, domainName } = payload;

  await workspaceBelongsToUser(workspaceId, userId);

  const [domainCreated] = await db
    .insert(schemas.domain)
    .values({
      name: domainName,
      workspaceId,
      verificationKey: generateDnsKey(),
      verificationStatus: "PENDING",
    })
    .returning();

  return domainCreated;
};

export const getUserWorkspaceDomains = async (
  userId: string,
  workspaceId: string,
) => {
  await workspaceBelongsToUser(workspaceId, userId);

  const domains = await db
    .select()
    .from(schemas.domain)
    .where(eq(schemas.domain.workspaceId, workspaceId));

  return domains;
};

export const verifyDnsService = async (domainId: string, userId: string) => {
  const domain = await db
    .select({
      name: schemas.domain.name,
      verificationKey: schemas.domain.verificationKey,
      workspaceId: schemas.domain.workspaceId,
    })
    .from(schemas.domain)
    .where(eq(schemas.domain.id, domainId))
    .limit(1);

  if (!domain.length) {
    throw new NotFound("Domain not found");
  }

  await workspaceBelongsToUser(domain[0].workspaceId, userId);

  const domainVerified = await verifyDnsKey(
    domain[0].name,
    domain[0].verificationKey,
  );

  const domainUpdated = await db
    .update(schemas.domain)
    .set({
      verificationStatus: domainVerified ? "VERIFIED" : "FAILED",
    })
    .where(eq(schemas.domain.id, domainId))
    .returning();

  return domainUpdated;
};
