import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { customer } from "./customer.schema";

export const sites = pgTable(
    "sites",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        customerId: integer().notNull().references(() => customer.id),
        domain: varchar().notNull().unique(),
        dnsVerificationKey: varchar(),
        dnsVerificationStatus: varchar(),
        apiKey: varchar(),
    },
);
