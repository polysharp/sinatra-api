import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

import { createId } from "@/helpers/custom-cuid2";

import { workspace } from "./workspace.schema";

export const apiKey = pgTable(
    "api_keys",
    {
        id: varchar()
            .$defaultFn(() => createId())
            .primaryKey().unique(),
        workspaceId: varchar().notNull().references(() => workspace.id),
        name: varchar().notNull(),
        value: varchar().notNull().unique(),
        createdAt: timestamp().defaultNow().notNull(),
        updatedAt: timestamp().defaultNow().$onUpdate(() => new Date())
            .notNull(),
    },
);
