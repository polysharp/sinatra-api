import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

import db from "../../database/database";
import schemas from "../../database/schemas";

export default new Elysia().get("/:email", async ({ params: { email } }) => {
    const customers = await db
        .select({
            customerId: schemas.customer.id,
            domain: schemas.customer.domain,
        })
        .from(schemas.user)
        .innerJoin(
            schemas.userCustomers,
            eq(schemas.userCustomers.userId, schemas.user.id),
        )
        .innerJoin(
            schemas.customer,
            eq(schemas.userCustomers.customerId, schemas.customer.id),
        )
        .where(eq(schemas.user.email, email));

    return customers;
}, {
    params: t.Object({
        email: t.String({ format: "email" }),
    }),
});
