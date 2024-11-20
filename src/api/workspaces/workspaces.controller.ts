import { Elysia, error, t } from "elysia";

import { authMiddleware } from "@/hooks/auth.handler";

import { models } from "../../database/models";
import { createWorkspace, getUserWorkspaces } from "./workspaces.service";

const { workspace } = models.workspace.insert;

export default new Elysia().group("/workspaces", (app) => {
    app
        .derive(authMiddleware)
        .post("/", async ({ user, set, body }) => {
            try {
                const workspaceCreated = await createWorkspace(
                    body.name,
                    user.id,
                );

                set.status = 201;
                return workspaceCreated;
            } catch (err) {
                console.error(err);
                return error(400);
            }
        }, {
            body: t.Object({
                name: workspace.name,
            }),
        })
        .get("/", async ({ user }) => {
            try {
                const workspacesFromDb = await getUserWorkspaces(
                    user.id,
                );

                return workspacesFromDb;
            } catch (err) {
                console.error(err);
                return error(404);
            }
        });
    return app;
});
