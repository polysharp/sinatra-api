import { and, eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { BadRequest, Forbidden, NotFound } from "@/helpers/HttpError";
import { generateDnsKey, verifyDnsKey } from "@/helpers/verify-dns-key";

import WorkspaceUserService from "../workspace-users/workspace-users.service";

type CreateDomainInput = {
  userId: string;
  workspaceId: string;
  domainName: string;
};

export default abstract class DomainService {
  /**
   * Creates a new domain associated with a workspace.
   * @param payload {CreateDomainInput} - Contains userId, workspaceId, and domainName.
   * @returns The newly created domain.
   */
  static async createDomain(payload: CreateDomainInput) {
    const { userId, workspaceId, domainName } = payload;

    await WorkspaceUserService.workspaceBelongsToUser(workspaceId, userId);

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
  }

  /**
   * Fetches all domains for a specific workspace.
   * @param userId {string} - The user's ID.
   * @param workspaceId {string} - The workspace's ID.
   * @returns A list of domains.
   */
  static async getUserWorkspaceDomains(userId: string, workspaceId: string) {
    await WorkspaceUserService.workspaceBelongsToUser(workspaceId, userId);

    const domains = await db
      .select()
      .from(schemas.domain)
      .where(eq(schemas.domain.workspaceId, workspaceId));

    return domains;
  }

  /**
   * Verifies the DNS key of a domain.
   * @param domainId {string} - The domain's ID.
   * @param userId {string} - The user's ID.
   * @returns The updated domain record.
   */
  static async verifyDns(domainId: string, userId: string) {
    const domain = await db
      .select({
        domainName: schemas.domain.name,
        domainVerificationKey: schemas.domain.verificationKey,
        verificationStatus: schemas.domain.verificationStatus,
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

    if (domain[0].verificationStatus === "VERIFIED") {
      return domain[0];
    }

    const domainVerified = await verifyDnsKey(
      domain[0].domainName,
      domain[0].domainVerificationKey,
    );

    const domainUpdated = await db
      .update(schemas.domain)
      .set({
        verificationStatus: domainVerified ? "VERIFIED" : "FAILED",
        verifiedAt: new Date(),
      })
      .where(eq(schemas.domain.id, domainId))
      .returning();

    if (domainVerified) {
      await db
        .update(schemas.site)
        .set({ enabled: true })
        .where(eq(schemas.site.domainId, domainId));
    }

    return domainUpdated;
  }

  /**
   * Checks if a domain exists in the specified workspace.
   * @param domainId - The ID of the domain to check.
   * @param workspaceId - The ID of the workspace to check within.
   * @returns The domain object if it exists.
   * @throws {BadRequest} If the domain does not exist.
   */
  static async domainExists(domainId: string, workspaceId: string) {
    const domain = await db
      .select()
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

    return domain[0];
  }

  /**
   * Updates a domain's details if the user has the ADMIN role.
   * If the domain name is updated, the verification status is set to pending and a new verification key is generated.
   * Additionally, all associated sites are disabled.
   * @param payload {object} - Contains domainId, userId, workspaceId, and domainName.
   * @returns The updated domain.
   */
  static async updateDomain(payload: {
    domainId: string;
    userId: string;
    workspaceId: string;
    domainName: string;
  }) {
    const { domainId, userId, workspaceId, domainName } = payload;

    const userRole = await WorkspaceUserService.getUserRoleInWorkspace(
      workspaceId,
      userId,
    );

    if (userRole !== "ADMIN") {
      throw new Forbidden("User does not have permission to update the domain");
    }

    const domain = await db
      .select()
      .from(schemas.domain)
      .where(
        and(
          eq(schemas.domain.id, domainId),
          eq(schemas.domain.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!domain.length) {
      throw new NotFound("Domain not found");
    }

    const updateFields: any = {};
    if (domainName && domainName !== domain[0].name) {
      updateFields.name = domainName;
      updateFields.verificationStatus = "PENDING";
      updateFields.verificationKey = generateDnsKey();

      await db
        .update(schemas.site)
        .set({ enabled: false })
        .where(eq(schemas.site.domainId, domainId));
    }

    if (Object.keys(updateFields).length === 0) {
      return domain[0];
    }

    const [updatedDomain] = await db
      .update(schemas.domain)
      .set(updateFields)
      .where(eq(schemas.domain.id, domainId))
      .returning();

    return updatedDomain;
  }

  /**
   * Deletes a domain if there are no related sites.
   * @param domainId - The ID of the domain to be deleted.
   * @param userId - The ID of the user requesting the deletion.
   * @param workspaceId - The ID of the workspace containing the domain.
   * @throws {Forbidden} If the user does not have permission to delete the domain.
   * @throws {NotFound} If the domain is not found or if there are associated sites.
   * @returns A promise that resolves when the domain is deleted.
   */
  static async deleteDomain(
    domainId: string,
    userId: string,
    workspaceId: string,
  ) {
    const userRole = await WorkspaceUserService.getUserRoleInWorkspace(
      workspaceId,
      userId,
    );

    if (userRole !== "ADMIN") {
      throw new Forbidden("User does not have permission to delete the domain");
    }

    const domain = await db
      .select()
      .from(schemas.domain)
      .where(
        and(
          eq(schemas.domain.id, domainId),
          eq(schemas.domain.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!domain.length) {
      throw new NotFound("Domain not found");
    }

    const associatedSites = await db
      .select()
      .from(schemas.site)
      .where(eq(schemas.site.domainId, domainId));

    if (associatedSites.length > 0) {
      throw new Forbidden("Cannot delete domain with associated sites");
    }

    await db
      .delete(schemas.domain)
      .where(eq(schemas.domain.id, domainId))
      .returning();
  }
}
