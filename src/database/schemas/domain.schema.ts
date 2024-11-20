import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

import { createId } from "@/helpers/custom-cuid2";

import { workspace } from "./workspace.schema";

export const domain = pgTable(
    "domains",
    {
        id: varchar()
            .$defaultFn(() => createId())
            .primaryKey().unique(),
        name: varchar().notNull(),
        workspaceId: varchar().notNull().references(() => workspace.id),
        verificationKey: varchar().notNull(),
        verifcationStatus: varchar({ enum: ["VERIFIED", "PENDING", "FAILED"] })
            .notNull(),
        verifiedAt: timestamp(),
        createdAt: timestamp().defaultNow().notNull(),
        updatedAt: timestamp().defaultNow().$onUpdate(() => new Date())
            .notNull(),
    },
);
