import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

import schemas from "./schemas";
import { spreads } from "./utils";

export const models = {
    user: {
        insert: spreads({
            user: createInsertSchema(schemas.user, {
                email: t.String({ format: "email" }),
            }),
        }, "insert"),
        select: spreads({
            user: createSelectSchema(schemas.user, {
                email: t.String({ format: "email" }),
                password: t.String({ format: "password" }),
            }),
        }, "select"),
    },
    customer: {
        insert: spreads({
            customer: createInsertSchema(schemas.customer, {
                domain: t.String({ format: "hostname" }),
            }),
        }, "insert"),
        select: spreads({
            customer: createSelectSchema(schemas.customer, {
                domain: t.String({ format: "hostname" }),
            }),
        }, "select"),
    },
    site: {
        insert: spreads({
            site: createInsertSchema(schemas.sites, {
                domain: t.String({ format: "hostname" }),
            }),
        }, "insert"),
        select: spreads({
            site: createSelectSchema(schemas.sites, {
                domain: t.String({ format: "hostname" }),
            }),
        }, "select"),
    },
} as const;
