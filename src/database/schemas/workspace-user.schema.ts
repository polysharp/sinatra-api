import {
  boolean,
  index,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { createId } from "@/helpers/custom-cuid2";

import { user } from "./user.schema";
import { workspace } from "./workspace.schema";

export const workspaceUser = pgTable(
  "workspace_users",
  {
    id: varchar()
      .$defaultFn(() => createId())
      .primaryKey()
      .unique(),
    workspaceId: varchar()
      .notNull()
      .references(() => workspace.id),
    userId: varchar()
      .notNull()
      .references(() => user.id),
    role: varchar({ enum: ["ADMIN", "USER"] }).notNull(),
    owner: boolean().notNull(),
  },
  (table) => ({
    workspaceUserUniqueIdx: uniqueIndex().on(table.workspaceId, table.userId),
    workspaceIdIdx: index().on(table.workspaceId),
    userIdIdx: index().on(table.userId),
  }),
);
