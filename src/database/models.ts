import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

import schemas from "./schemas";
import { spreads } from "./utils";

export const models = {
  analysis: {
    insert: spreads(
      {
        analysis: createInsertSchema(schemas.analysis),
      },
      "insert",
    ),
    select: spreads(
      {
        analysis: createSelectSchema(schemas.analysis),
      },
      "select",
    ),
  },
  apiKey: {
    insert: spreads(
      {
        apiKey: createInsertSchema(schemas.apiKey),
      },
      "insert",
    ),
    select: spreads(
      {
        apiKey: createSelectSchema(schemas.apiKey),
      },
      "select",
    ),
  },
  domain: {
    insert: spreads(
      {
        domain: createInsertSchema(schemas.domain, {
          name: t.RegExp(/^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,}$/),
        }),
      },
      "insert",
    ),
    select: spreads(
      {
        domain: createSelectSchema(schemas.domain, {
          name: t.RegExp(/^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,}$/),
        }),
      },
      "select",
    ),
  },
  site: {
    insert: spreads(
      {
        site: createInsertSchema(schemas.site),
      },
      "insert",
    ),
    select: spreads(
      {
        site: createSelectSchema(schemas.site),
      },
      "select",
    ),
  },
  user: {
    insert: spreads(
      {
        user: createInsertSchema(schemas.user, {
          email: t.String({ format: "email" }),
        }),
      },
      "insert",
    ),
    select: spreads(
      {
        user: createSelectSchema(schemas.user, {
          email: t.String({ format: "email" }),
        }),
      },
      "select",
    ),
  },
  workspace: {
    insert: spreads(
      {
        workspace: createInsertSchema(schemas.workspace),
      },
      "insert",
    ),
    select: spreads(
      {
        workspace: createSelectSchema(schemas.workspace),
      },
      "select",
    ),
  },
} as const;
