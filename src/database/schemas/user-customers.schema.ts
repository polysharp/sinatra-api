import { integer, pgTable } from "drizzle-orm/pg-core";

import { customer } from "./customer.schema";
import { user } from "./user.schema";

export const userCustomers = pgTable(
    "user-customers",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        customerId: integer().notNull().references(() => customer.id),
        userId: integer().notNull().references(() => user.id),
    },
);
