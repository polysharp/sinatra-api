import { eq } from "drizzle-orm";

import db from "../../database/database";
import schemas from "../../database/schemas";

type CreateCustomerInput = {
    email: string;
    domain: string;
    name: string;
};

export const createCustomerService = async (payload: CreateCustomerInput) => {
    const { email, domain, name } = payload;

    const [{ id: customerId }] = await db.insert(schemas.customer).values({
        domain,
        name,
    }).returning({ id: schemas.customer.id });

    const [{ id: userId }] = await db.select().from(schemas.user).where(
        eq(schemas.user.email, email),
    ).limit(1);

    if (!userId) {
        throw new Error("User not found");
    }

    await db.insert(schemas.userCustomers).values({
        customerId,
        userId,
    });

    return { id: customerId, name };
};

export const getCustomersWithEmail = async (email: string) => {
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

    return customers.length ? customers : null;
};
