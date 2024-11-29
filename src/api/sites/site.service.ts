import { eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { BadRequest, NotFound } from "@/helpers/HttpError";

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

export default abstract class SiteService {
  /**
   * Creates a new site
   * @param payload - The input data for creating a site
   * @returns The created site
   * @throws {Forbidden} - If the user does not belong to the workspace
   * @throws {BadRequest} - If the API key does not exist
   * @throws {BadRequest} - If the Domain does not exist
   */
  static async createSite(payload: CreateSiteInput) {
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
  }

  /**
   * Retrieves all sites for a given workspace
   * @param workspaceId - The ID of the workspace
   * @param userId - The ID of the user
   * @returns The list of sites
   * @throws {Forbidden} - If the user does not belong to the workspace
   */
  static async getSites(workspaceId: string, userId: string) {
    await WorkspaceUserService.workspaceBelongsToUser(workspaceId, userId);

    const sites = await db
      .select()
      .from(schemas.site)
      .where(eq(schemas.site.workspaceId, workspaceId));

    return sites;
  }

  /**
   * Retrieves a site by its ID
   * @param siteId - The ID of the site
   * @param workspaceId - The ID of the workspace
   * @param userId - The ID of the user
   * @returns The site
   * @throws {NotFound} - If the site is not found
   * @throws {Forbidden} - If the user does not belong to the workspace
   */
  static async getSiteById(
    siteId: string,
    workspaceId: string,
    userId: string,
  ) {
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
  }

  /**
   * Updates a site by its ID
   * @param payload - The input data for updating a site
   * @returns The updated site
   * @throws {Forbidden} - If the user does not belong to the workspace
   * @throws {BadRequest} - If the Api Key does not exist
   * @throws {BadRequest} - If the site does not exist
   */
  static async updateSiteById(payload: {
    siteId: string;
    workspaceId: string;
    userId: string;
    updateData: Partial<{
      name: string;
      apiKeyId: string;
    }>;
  }) {
    const { siteId, workspaceId, userId, updateData } = payload;

    const userRole = await WorkspaceUserService.getUserRoleInWorkspace(
      workspaceId,
      userId,
    );

    if (userRole !== "ADMIN") {
      throw new Error("User does not have permission to update the site");
    }

    if (updateData.apiKeyId) {
      await ApiKeyService.apiKeyExists(updateData.apiKeyId, workspaceId);
    }

    const [site] = await db
      .select()
      .from(schemas.site)
      .where(eq(schemas.site.id, siteId))
      .limit(1);

    if (!site) {
      throw new BadRequest("Site not found");
    }

    const domain = await DomainService.domainExists(site.domainId, workspaceId);
    const isDomainVerified = domain.verificationStatus === "VERIFIED";

    const [updatedSite] = await db
      .update(schemas.site)
      .set({
        ...updateData,
        enabled: isDomainVerified,
      })
      .where(eq(schemas.site.id, siteId))
      .returning();

    return updatedSite;
  }
}
