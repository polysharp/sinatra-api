import {
  index,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { createId } from "@/helpers/custom-cuid2";

import { site } from "./site.schema";

export const analysis = pgTable(
  "analyses",
  {
    id: varchar()
      .$defaultFn(() => createId())
      .primaryKey()
      .unique(),
    siteId: varchar()
      .notNull()
      .references(() => site.id),
    performance: integer().notNull().default(0),
    accessibility: integer().notNull().default(0),
    bestPractices: integer().notNull().default(0),
    seo: integer().notNull().default(0),
    status: varchar({
      enum: ["SUCCESS", "PENDING", "FAILED"],
    }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    analysisSiteIdIdx: index().on(table.siteId),
    analysisUpdatedAtIdx: index().on(table.updatedAt),
  }),
);
