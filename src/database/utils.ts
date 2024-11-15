import { Kind, type TObject } from "@sinclair/typebox";
import type { Table } from "drizzle-orm";
import {
    type BuildInsertSchema,
    type BuildSelectSchema,
    createInsertSchema,
    createSelectSchema,
} from "drizzle-typebox";

type Spread<
    T extends TObject | Table,
    Mode extends "select" | "insert" | undefined,
> = T extends TObject<infer Fields> ? {
        [K in keyof Fields]: Fields[K];
    }
    : T extends Table ? Mode extends "select" ? BuildSelectSchema<T, {}>
        : Mode extends "insert" ? BuildInsertSchema<T, {}>
        : {}
    : {};

export const spread = <
    T extends TObject | Table,
    Mode extends "select" | "insert" | undefined,
>(
    schema: T,
    mode?: Mode,
): Spread<T, Mode> => {
    const newSchema: Record<string, unknown> = {};
    let table;

    switch (mode) {
        case "insert":
        case "select":
            if (Kind in schema) {
                table = schema;
                break;
            }

            table = mode === "insert"
                ? createInsertSchema(schema)
                : createSelectSchema(schema);

            break;

        default:
            if (!(Kind in schema)) throw new Error("Expect a schema");
            table = schema;
    }

    for (const key of Object.keys(table.properties)) {
        newSchema[key] = table.properties[key];
    }

    return newSchema as any;
};

export const spreads = <
    T extends Record<string, TObject | Table>,
    Mode extends "select" | "insert" | undefined,
>(
    models: T,
    mode?: Mode,
): {
    [K in keyof T]: Spread<T[K], Mode>;
} => {
    const newSchema: Record<string, unknown> = {};
    const keys = Object.keys(models);

    for (const key of keys) newSchema[key] = spread(models[key], mode);

    return newSchema as any;
};
