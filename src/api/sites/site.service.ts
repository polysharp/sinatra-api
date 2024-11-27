import { eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { NotFound } from "@/helpers/HttpError";

import { apiKeyExists } from "../api-keys/api-key.service";
import { domainExistsAndValid } from "../domains/domain.service";
import { workspaceBelongsToUser } from "../workspace-users/workspace-users.service";

type CreateSiteInput = {
  userId: string;
  workspaceId: string;
  domainId: string;
  apiKeyId: string;
};

export const createSiteService = async (payload: CreateSiteInput) => {
  const { workspaceId, domainId, apiKeyId, userId } = payload;

  await workspaceBelongsToUser(workspaceId, userId);
  await apiKeyExists(apiKeyId, workspaceId);
  await domainExistsAndValid(domainId, workspaceId);

  const [siteCreated] = await db
    .insert(schemas.site)
    .values({
      workspaceId,
      domainId,
      apiKeyId,
    })
    .returning();

  return siteCreated;
};

export const getSitesService = async (workspaceId: string, userId: string) => {
  await workspaceBelongsToUser(workspaceId, userId);

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
  await workspaceBelongsToUser(workspaceId, userId);

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
