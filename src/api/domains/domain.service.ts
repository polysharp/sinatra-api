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

    return domainUpdated;
  }

  /**
   * Validates whether a domain exists and is verified.
   * @param domainId {string} - The domain's ID.
   * @param workspaceId {string} - The workspace's ID.
   * @throws {BadRequest | Forbidden} - If the domain doesn't exist or isn't verified.
   */
  static async domainExistsAndValid(domainId: string, workspaceId: string) {
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
  }
}
