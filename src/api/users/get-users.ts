import { Elysia } from "elysia";

import db from "../../database/database";
import schemas from "../../database/schemas";

export default new Elysia().get("/", async () => {
    const users = await db.select().from(schemas.user);

    return users;
});
