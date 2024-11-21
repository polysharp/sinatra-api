import { and, eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";

type CreateSiteInput = {
  userId: string;
  workspaceId: string;
  domainId: string;
  apiKeyId: string;
};

export const createSiteService = async (payload: CreateSiteInput) => {
  const { workspaceId, domainId, apiKeyId, userId } = payload;

  if (!userId) {
    throw new Error("UserId is required");
  }

  const workspaceExists = await db
    .select({
      workspaceId: schemas.workspace.id,
    })
    .from(schemas.workspace)
    .where(eq(schemas.workspace.id, workspaceId))
    .limit(1);

  if (!workspaceExists.length) {
    throw new Error("Workspace not found");
  }

  const workspaceBelongsToUser = await db
    .select()
    .from(schemas.workspaceUser)
    .where(
      and(
        eq(schemas.workspaceUser.workspaceId, workspaceId),
        eq(schemas.workspaceUser.userId, userId),
      ),
    )
    .limit(1);

  if (!workspaceBelongsToUser.length) {
    throw new Error("Workspace does not belong to user");
  }

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

// export const verifyDnsService = async (payload: VerifyDnsInput) => {
//     const { siteId, userId } = payload;

//     if (!userId) {
//         throw new Error("UserId is required");
//     }

//     if (!siteId) {
//         throw new Error("SiteId is required");
//     }

//     const [site] = await db.select().from(schemas.sites).where(
//         eq(schemas.sites.id, siteId),
//     ).limit(1);

//     if (!site) {
//         throw new Error("Site not found");
//     }

//     if (site.dnsVerificationStatus === "verified") {
//         return { status: "verified" };
//     }

//     const [customerBelongsToUser] = await db.select().from(
//         schemas.userCustomers,
//     )
//         .where(
//             and(
//                 eq(schemas.userCustomers.customerId, site.customerId),
//                 eq(schemas.userCustomers.userId, userId),
//             ),
//         );

//     if (!customerBelongsToUser) {
//         throw new Error("Site does not belong to user");
//     }

//     if (customerBelongsToUser.customerId !== site.customerId) {
//         throw new Error("Site does not belong to customer");
//     }

//     const dnsKeyVerifies = await verifyDnsKey(
//         site.domain,
//         site.dnsVerificationKey,
//     );

//     const [updatedSite] = await db.update(schemas.sites).set({
//         dnsVerificationStatus: dnsKeyVerifies ? "verified" : "failed",
//     }).where(eq(schemas.sites.id, siteId)).returning({
//         dnsVerificationStatus: schemas.sites.dnsVerificationStatus,
//     });

//     return { status: updatedSite.dnsVerificationStatus };
// };
