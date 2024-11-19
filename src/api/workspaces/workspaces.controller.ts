import { Elysia, error, t } from "elysia";

import { models } from "../../database/models";
import authHandler from "../../hooks/auth.handler";
import {
    createWorkspaceService,
    getWorkspacesWithEmail,
} from "./workspaces.service";

const { workspace } = models.workspace.insert;

export default new Elysia().group("/workspaces", (app) => {
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
        .post("/", async ({ user, set, body }) => {
            try {
                const workspaceCreted = await createWorkspaceService(
                    body.name,
                    user.id,
                );

                set.status = 201;
                return workspaceCreted;
            } catch (err) {
                console.error(err);
                return error(400);
            }
        }, {
            body: t.Object({
                name: workspace.name,
            }),
        }).get("/", async ({ user }) => {
            try {
                const workspacesFromDb = await getWorkspacesWithEmail(
                    user.email,
                );

                return workspacesFromDb;
            } catch (err) {
                console.error(err);
                return error(404);
            }
        });
    return app;
});
