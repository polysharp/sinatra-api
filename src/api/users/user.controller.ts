import { Elysia } from "elysia";

import { authMiddleware } from "@/hooks/auth.handler";

import UserService from "./user.service";

export default new Elysia().group("/users", (app) => {
  app
    .derive(authMiddleware)
    .get("/me", async ({ user }) => {
      const userFromDb = await UserService.getUserWithEmail(user.email);

      return userFromDb;
    })
    .get("/", async () => {
      const usersFromDb = await UserService.getUsers();
      return usersFromDb;
    });
  return app;
});
