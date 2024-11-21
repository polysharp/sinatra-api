import { pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { createId } from "@/helpers/custom-cuid2";

import { apiKey } from "./api-keys.schema";
import { domain } from "./domain.schema";
import { workspace } from "./workspace.schema";

export const site = pgTable(
  "sites",
  {
    id: varchar()
      .$defaultFn(() => createId())
      .primaryKey()
      .unique(),
    workspaceId: varchar()
      .notNull()
      .references(() => workspace.id),
    domainId: varchar()
      .notNull()
      .references(() => domain.id),
    apiKeyId: varchar()
      .notNull()
      .references(() => apiKey.id),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    workspaceUserUniqueIdx: uniqueIndex().on(table.workspaceId, table.domainId),
  }),
);
