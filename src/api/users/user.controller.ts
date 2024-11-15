import { Elysia, error } from "elysia";

import { getUsers, getUserWithEmail } from "./user.service";
import authHandler from "../../hooks/auth.handler";

export default new Elysia().group("/users", (app) => {
    app
        .derive(async ({ headers: { authorization } }) => {
            const user = await authHandler(authorization);
            if (!user) {
                return error("Unauthorized");
            }

            return {
                user: {
                    id: user.userId,
                    email: user.email,
                },
            };
        })
        .get("/me", async ({ user }) => {
            const userFromDb = await getUserWithEmail(user.email);

            return userFromDb;
        })
        .get("/", async () => {
            const usersFromDb = await getUsers();
            return usersFromDb;
        });
    return app;
});
