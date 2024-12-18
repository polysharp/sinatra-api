import { Elysia, t } from "elysia";

import config from "@/config";
import { models } from "@/database/models";

import UserService from "../users/user.service";
import AuthService from "./auth.service";

const { user } = models.user.insert;

export default new Elysia().group("/auth", (app) => {
  app.post(
    "/sign",
    async ({ body, set, cookie: { session } }) => {
      const { email, password } = body;

      let user, token;

      const userFromDb = await UserService.getUser({ email }, true);
      if (userFromDb) {
        const signInRes = await AuthService.signIn(userFromDb, password);

        user = signInRes.user;
        token = signInRes.token;

        set.status = 200;
      } else {
        const signUpRes = await AuthService.signUp(email, password);

        user = signUpRes.user;
        token = signUpRes.token;

        set.status = 201;
      }

      session.set({
        value: token,
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        domain: config.COOKIE_DOMAIN,
      });

      return { user, token };
    },
    {
      body: t.Object({
        email: user.email,
        password: user.password,
      }),
    },
  );

  return app;
});
