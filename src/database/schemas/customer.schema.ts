import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const customer = pgTable(
    "customers",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        name: varchar().notNull(),
        domain: varchar().notNull().unique(),
    },
);
