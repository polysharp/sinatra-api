import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

import schemas from "./schemas";
import { spreads } from "./utils";

export const models = {
    apiKey: {
        insert: spreads({
            apiKey: createInsertSchema(schemas.apiKey),
        }, "insert"),
        select: spreads({
            apiKey: createSelectSchema(schemas.apiKey),
        }, "select"),
    },
    domain: {
        insert: spreads({
            domain: createInsertSchema(schemas.domain),
        }, "insert"),
        select: spreads({
            domain: createSelectSchema(schemas.domain),
        }, "select"),
    },
    site: {
        insert: spreads({
            site: createInsertSchema(schemas.site),
        }, "insert"),
        select: spreads({
            site: createSelectSchema(schemas.site),
        }, "select"),
    },
    user: {
        insert: spreads({
            user: createInsertSchema(schemas.user, {
                email: t.String({ format: "email" }),
            }),
        }, "insert"),
        select: spreads({
            user: createSelectSchema(schemas.user, {
                email: t.String({ format: "email" }),
            }),
        }, "select"),
    },
    workspace: {
        insert: spreads({
            workspace: createInsertSchema(schemas.workspace),
        }, "insert"),
        select: spreads({
            workspace: createSelectSchema(schemas.workspace),
        }, "select"),
    },
} as const;
