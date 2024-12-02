import { Elysia, t } from "elysia";

import { models } from "@/database/models";
import authGuard from "@/hooks/auth.guard";
import { authMiddleware } from "@/hooks/auth.handler";

import WorkspaceUserService from "../workspace-users/workspace-users.service";
import WorkspaceService from "./workspaces.service";

const { workspace } = models.workspace.select;

export default new Elysia().group("/workspaces", (app) => {
  app
    .derive(authMiddleware)
    .guard(authGuard)
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
    )
    .put(
      "/:workspaceId",
      async ({ user, params: { workspaceId }, body: { name } }) => {
        const updatedWorkspace = await WorkspaceService.updateWorkspace(
          user.id,
          workspaceId,
          { name },
        );

        return updatedWorkspace;
      },
      {
        params: t.Object({
          workspaceId: workspace.id,
        }),
        body: t.Object({
          name: workspace.name,
        }),
      },
    )
    .delete(
      "/:workspaceId",
      async ({ user, params: { workspaceId }, body: { name, password } }) => {
        await WorkspaceService.deleteWorkspace(
          user.id,
          workspaceId,
          name,
          password,
        );

        return { message: "Workspace deleted successfully" };
      },
      {
        params: t.Object({
          workspaceId: workspace.id,
        }),
        body: t.Object({
          name: workspace.name,
          password: t.String(),
        }),
      },
    );

  return app;
});
