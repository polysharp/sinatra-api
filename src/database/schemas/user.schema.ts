import {
    integer,
    pgTable,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable(
    "users",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        email: varchar().notNull().unique(),
        password: varchar().notNull(),
        createdAt: timestamp().defaultNow().notNull(),
    },
    (table) => {
        return {
            emailIndex: uniqueIndex("email_idx").on(table.email),
        };
    },
);
