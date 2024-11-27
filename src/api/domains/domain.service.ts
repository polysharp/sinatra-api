import { and, eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { BadRequest, Forbidden, NotFound } from "@/helpers/HttpError";
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
      domainName: schemas.domain.name,
      domainVerifivationKey: schemas.domain.verificationKey,
    })
    .from(schemas.domain)
    .innerJoin(
      schemas.workspace,
      eq(schemas.domain.workspaceId, schemas.workspace.id),
    )
    .innerJoin(
      schemas.workspaceUser,
      eq(schemas.workspace.id, schemas.workspaceUser.workspaceId),
    )
    .where(
      and(
        eq(schemas.domain.id, domainId),
        eq(schemas.workspaceUser.userId, userId),
      ),
    )
    .limit(1);

  if (!domain.length) {
    throw new NotFound("Domain not found");
  }

  const domainVerified = await verifyDnsKey(
    domain[0].domainName,
    domain[0].domainVerifivationKey,
  );

  const domainUpdated = await db
    .update(schemas.domain)
    .set({
      verificationStatus: domainVerified ? "VERIFIED" : "FAILED",
      verifiedAt: new Date(),
    })
    .where(eq(schemas.domain.id, domainId))
    .returning();

  return domainUpdated;
};

export const domainExistsAndValid = async (
  domainId: string,
  workspaceId: string,
) => {
  const domain = await db
    .select({
      verificationStatus: schemas.domain.verificationStatus,
    })
    .from(schemas.domain)
    .where(
      and(
        eq(schemas.domain.id, domainId),
        eq(schemas.domain.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  if (!domain.length) {
    throw new BadRequest("Domain does not exist");
  }

  if (domain[0].verificationStatus !== "VERIFIED") {
    throw new Forbidden("Domain is not verified");
  }
};
