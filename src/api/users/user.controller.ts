import { Elysia, t } from "elysia";

import { models } from "@/database/models";
import authGuard from "@/hooks/auth.guard";
import { authMiddleware } from "@/hooks/auth.handler";

import UserService from "./user.service";

const { workspace } = models.workspace.select;

export default new Elysia().group("/users", (app) => {
  app
    .derive(authMiddleware)
    .guard(authGuard)
    .get("/me", async ({ user }) => {
      const userFromDb = await UserService.getUserWithEmail(user.email);

      return userFromDb;
    })
    .get(
      "/",
      async ({ user, query: { workspaceId } }) => {
        const usersFromDb = await UserService.getUsers(workspaceId, user.id);
        return usersFromDb;
      },
      {
        query: t.Object({
          workspaceId: workspace.id,
        }),
      },
    );
  return app;
});
