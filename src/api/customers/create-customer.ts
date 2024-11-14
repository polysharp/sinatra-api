import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";

import db from "../../database/database";
import { models } from "../../database/models";
import schemas from "../../database/schemas";

const { customer } = models.customer.insert;
const { user } = models.user.insert;

export default new Elysia().post("/", async ({ body, set }) => {
    const { email, domain, name } = body;

    const [{ id: customerId }] = await db.insert(schemas.customer).values({
        domain,
        name,
    }).returning({ id: schemas.customer.id });

    const [{ id: userId }] = await db.select().from(schemas.user).where(
        eq(schemas.user.email, email),
    ).limit(1);

    await db.insert(schemas.userCustomers).values({
        customerId,
        userId,
    });

    set.status = 201;
    return { id: customerId, name };
}, {
    body: t.Object({
        email: user.email,
        domain: customer.domain,
        name: customer.name,
    }),
});
