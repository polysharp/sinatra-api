import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

import db from "../../database/database";
import schemas from "../../database/schemas";

export default new Elysia().get("/:email", async ({ params: { email } }) => {
    const [user] = await db.select().from(schemas.user).where(
        eq(schemas.user.email, email),
    ).limit(1);
    return user;
}, {
    params: t.Object({
        email: t.String({ format: "email" }),
    }),
});
