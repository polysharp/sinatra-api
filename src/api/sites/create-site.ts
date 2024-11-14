import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

import db from "../../database/database";
import { models } from "../../database/models";
import schemas from "../../database/schemas";

const { site } = models.site.insert;
const { user } = models.user.insert;

export default new Elysia().post("/", async ({ body, set }) => {
    const {
        customerId,
        domain,
        dnsVerificationKey,
        dnsVerificationStatus,
        apiKey,
        userId, // TODO: Workaround til auth module is ready => will be added to the context if the user is logged in
    } = body;

    if (!userId) {
        set.status = 400;
        return { error: "userId is required" };
    }

    const customerExists = await db.select({ customerId: schemas.customer.id })
        .from(schemas.customer).where(
            eq(schemas.customer.id, customerId),
        ).limit(1);

    if (!customerExists.length) {
        set.status = 404;
        return { error: "Customer not found" };
    }

    const customerBelongsToUser = await db.select().from(schemas.userCustomers)
        .where(
            and(
                eq(schemas.userCustomers.customerId, customerId),
                eq(schemas.userCustomers.userId, userId),
            ),
        ).limit(1);

    if (!customerBelongsToUser.length) {
        set.status = 403;
        return { error: "Customer does not belong to user" };
    }

    const [siteCreated] = await db.insert(schemas.sites).values({
        customerId,
        domain,
        dnsVerificationKey,
        dnsVerificationStatus,
        apiKey,
    }).returning();

    set.status = 201;
    return siteCreated;
}, {
    body: t.Object({
        customerId: site.customerId,
        userId: user.id,
        domain: site.domain,
        dnsVerificationKey: site.dnsVerificationKey,
        dnsVerificationStatus: site.dnsVerificationStatus,
        apiKey: site.apiKey,
    }),
});
