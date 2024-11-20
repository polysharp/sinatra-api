import { Elysia } from "elysia";

import { authMiddleware } from "@/hooks/auth.handler";

import { getUsers, getUserWithEmail } from "./user.service";

export default new Elysia().group("/users", (app) => {
    app
        .derive(authMiddleware)
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
