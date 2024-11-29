import { eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { NotFound } from "@/helpers/HttpError";

import ApiKeyService from "../api-keys/api-key.service";
import DomainService from "../domains/domain.service";
import WorkspaceUserService from "../workspace-users/workspace-users.service";

type CreateSiteInput = {
  name: string;
  userId: string;
  workspaceId: string;
  domainId: string;
  apiKeyId: string;
};

export const createSiteService = async (payload: CreateSiteInput) => {
  const { name, workspaceId, domainId, apiKeyId, userId } = payload;

  await WorkspaceUserService.workspaceBelongsToUser(workspaceId, userId);
  await ApiKeyService.apiKeyExists(apiKeyId, workspaceId);
  const domain = await DomainService.domainExists(domainId, workspaceId);

  const isDomainVerified = domain.verificationStatus === "VERIFIED";

  const [siteCreated] = await db
    .insert(schemas.site)
    .values({
      name,
      enabled: isDomainVerified,
      workspaceId,
      domainId,
      apiKeyId,
    })
    .returning();

  return siteCreated;
};

export const getSitesService = async (workspaceId: string, userId: string) => {
  await WorkspaceUserService.workspaceBelongsToUser(workspaceId, userId);

  const sites = await db
    .select()
    .from(schemas.site)
    .where(eq(schemas.site.workspaceId, workspaceId));

  return sites;
};

export const getSiteByIdService = async (
  siteId: string,
  workspaceId: string,
  userId: string,
) => {
  await WorkspaceUserService.workspaceBelongsToUser(workspaceId, userId);

  const sites = await db
    .select()
    .from(schemas.site)
    .where(eq(schemas.site.id, siteId))
    .limit(1);

  if (!sites.length) {
    throw new NotFound("Site not found");
  }

  return sites[0];
};
