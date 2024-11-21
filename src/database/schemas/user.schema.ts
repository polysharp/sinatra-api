import { pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { createId } from "@/helpers/custom-cuid2";

export const user = pgTable(
  "users",
  {
    id: varchar()
      .$defaultFn(() => createId())
      .primaryKey()
      .unique(),
    email: varchar().notNull().unique(),
    password: varchar().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    emailUniqueIdx: uniqueIndex().on(table.email),
  }),
);
