import { Elysia, t } from "elysia";

import { models } from "@/database/models";

import { getUserWithEmail } from "../users/user.service";
import { signInService, signUpService } from "./auth.service";

const { user } = models.user.insert;

export default new Elysia().group("/auth", (app) => {
    app.post("/sign", async ({ body, set, cookie: { session } }) => {
        const { email, password } = body;

        let user, token;

        const userFromDb = await getUserWithEmail(email, true);
        if (userFromDb) {
            const signInRes = await signInService(userFromDb, password);

            user = signInRes.user;
            token = signInRes.token;

            set.status = 200;
        } else {
            const signUpRes = await signUpService(email, password);

            user = signUpRes.user;
            token = signUpRes.token;

            set.status = 201;
        }

        session.set({
            value: token,
            path: "/",
            secure: true,
            httpOnly: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30,
        });

        return { user, token };
    }, {
        body: t.Object({
            email: user.email,
            password: user.password,
        }),
    });

    return app;
});
