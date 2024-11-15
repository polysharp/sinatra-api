import { and, eq } from "drizzle-orm";

import db from "../../database/database";
import schemas from "../../database/schemas";
import { verifyDnsKey } from "../../helpers/verify-dns-key";

type VerifyDnsInput = {
    siteId: number;
    userId: number;
};

type CreateSiteInput = {
    userId: number;
    customerId: number;
    domain: string;
    apiKey?: string | null | undefined;
};

export const createSiteService = async (payload: CreateSiteInput) => {
    const { customerId, domain, apiKey, userId } = payload;

    if (!userId) {
        throw new Error("UserId is required");
    }

    const customerExists = await db.select({ customerId: schemas.customer.id })
        .from(schemas.customer)
        .where(eq(schemas.customer.id, customerId))
        .limit(1);

    if (!customerExists.length) {
        throw new Error("Customer not found");
    }

    const customerBelongsToUser = await db.select().from(schemas.userCustomers)
        .where(
            and(
                eq(schemas.userCustomers.customerId, customerId),
                eq(schemas.userCustomers.userId, userId),
            ),
        )
        .limit(1);

    if (!customerBelongsToUser.length) {
        throw new Error("Customer does not belong to user");
    }

    const dnsVerificationKey = Math.random().toString(36).slice(2);

    const [siteCreated] = await db.insert(schemas.sites).values({
        customerId,
        domain,
        dnsVerificationKey,
        dnsVerificationStatus: "pending",
        apiKey,
    }).returning();

    return siteCreated;
};

export const verifyDnsService = async (payload: VerifyDnsInput) => {
    const { siteId, userId } = payload;

    if (!userId) {
        throw new Error("UserId is required");
    }

    if (!siteId) {
        throw new Error("SiteId is required");
    }

    const [site] = await db.select().from(schemas.sites).where(
        eq(schemas.sites.id, siteId),
    ).limit(1);

    if (!site) {
        throw new Error("Site not found");
    }

    if (site.dnsVerificationStatus === "verified") {
        return { status: "verified" };
    }

    const [customerBelongsToUser] = await db.select().from(
        schemas.userCustomers,
    )
        .where(
            and(
                eq(schemas.userCustomers.customerId, site.customerId),
                eq(schemas.userCustomers.userId, userId),
            ),
        );

    if (!customerBelongsToUser) {
        throw new Error("Site does not belong to user");
    }

    if (customerBelongsToUser.customerId !== site.customerId) {
        throw new Error("Site does not belong to customer");
    }

    const dnsKeyVerifies = await verifyDnsKey(
        site.domain,
        site.dnsVerificationKey,
    );

    const [updatedSite] = await db.update(schemas.sites).set({
        dnsVerificationStatus: dnsKeyVerifies ? "verified" : "failed",
    }).where(eq(schemas.sites.id, siteId)).returning({
        dnsVerificationStatus: schemas.sites.dnsVerificationStatus,
    });

    return { status: updatedSite.dnsVerificationStatus };
};
