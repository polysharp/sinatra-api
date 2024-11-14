import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

import db from "../../database/database";
import { models } from "../../database/models";
import schemas from "../../database/schemas";
import { verifyDnsKey } from "../../helpers/verify-dns-key";

const { site } = models.site.insert;
const { user } = models.user.insert;

export default new Elysia().patch("/verify-dns", async ({ body, set }) => {
    const {
        siteId,
        userId, // TODO: Workaround til auth module is ready => will be added to the context if the user is logged in
    } = body;

    if (!userId) {
        set.status = 400;
        return { error: "userId is required" };
    }

    if (!siteId) {
        set.status = 400;
        return { error: "siteId is required" };
    }

    const [site] = await db.select().from(schemas.sites).where(
        eq(schemas.sites.id, siteId),
    ).limit(1);
    if (!site) {
        set.status = 404;
        return { error: "Site not found" };
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
        set.status = 403;
        return { error: "Site does not belong to user" };
    }

    if (customerBelongsToUser.customerId !== site.customerId) {
        set.status = 403;
        return { error: "Site does not belong to customer" };
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

    set.status = 200;
    return { status: updatedSite.dnsVerificationStatus };
}, {
    body: t.Object({
        userId: user.id,
        siteId: site.id,
    }),
});
