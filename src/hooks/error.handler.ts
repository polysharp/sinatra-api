import Elysia from "elysia";

import { HttpError } from "@/helpers/HttpError";

export default (app: Elysia): Elysia => {
  app.onError((ctx) => {
    if (ctx.error instanceof HttpError) {
      ctx.set.status = ctx.error.statusCode;
    } else {
      ctx.set.status = 500;
      ctx.response = {
        error: "Internal Server Error",
      };
    }
    ctx.store = { error: ctx.error, ...ctx.store };
  });

  return app;
};
