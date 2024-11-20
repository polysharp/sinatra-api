import { Elysia, t } from "elysia";

import { models } from "@/database/models";

import { getUserWithEmail } from "../users/user.service";
import { signInService, signUpService } from "./auth.service";

const { user } = models.user.insert;

export default new Elysia().group("/auth", (app) => {
    app.post("/sign", async ({ body, set }) => {
        const { email, password } = body;

        const userFromDb = await getUserWithEmail(email, true);
        if (userFromDb) {
            const { user, token } = await signInService(userFromDb, password);
            set.status = 200;
            return { user, token };
        }

        const { user, token } = await signUpService(email, password);

        set.status = 201;
        return { user, token };
    }, {
        body: t.Object({
            email: user.email,
            password: user.password,
        }),
    });

    return app;
});
