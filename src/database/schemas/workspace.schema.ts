import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

import { createId } from "@/helpers/custom-cuid2";

export const workspace = pgTable(
    "workspaces",
    {
        id: varchar()
            .$defaultFn(() => createId())
            .primaryKey().unique(),
        name: varchar().notNull(),
        createdAt: timestamp().defaultNow().notNull(),
        updatedAt: timestamp().defaultNow().$onUpdate(() => new Date())
            .notNull(),
    },
);
