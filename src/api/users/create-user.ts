import { Elysia, t } from "elysia";

import db from "../../database/database";
import { models } from "../../database/models";
import schemas from "../../database/schemas";

const { user } = models.user.insert;

export default new Elysia().post("/", async ({ body, set }) => {
    const { email, password } = body;

    await db.insert(schemas.user).values({
        email,
        password,
    });

    set.status = 201;
    return { email, password };
}, {
    body: t.Object(user),
});
