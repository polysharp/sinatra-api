import { Elysia, t } from "elysia";

import { models } from "@/database/models";
import { authMiddleware } from "@/hooks/auth.handler";

import WorkspaceUserService from "../workspace-users/workspace-users.service";
import WorkspaceService from "./workspaces.service";

const { workspace } = models.workspace.select;

export default new Elysia().group("/workspaces", (app) => {
  app
    .derive(authMiddleware)
    .post(
      "/",
      async ({ user, set, body }) => {
        const workspaceCreated = await WorkspaceService.createWorkspace(
          body.name,
          user.id,
        );

        set.status = 201;
        return workspaceCreated;
      },
      {
        body: t.Object({
          name: workspace.name,
        }),
      },
    )
    .get("/", async ({ user }) => {
      const workspacesFromDb = await WorkspaceUserService.getUserWorkspaces(
        user.id,
      );

      return workspacesFromDb;
    })
    .get(
      "/:workspaceId",
      async ({ user, params: { workspaceId } }) => {
        const workspaceFromDb = await WorkspaceService.getUserWorkspaceById(
          user.id,
          workspaceId,
        );
        return workspaceFromDb;
      },
      {
        params: t.Object({
          workspaceId: workspace.id,
        }),
      },
    );

  return app;
});
