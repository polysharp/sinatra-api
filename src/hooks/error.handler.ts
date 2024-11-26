import Elysia from "elysia";

import { HttpError } from "@/helpers/HttpError";
import logger from "@/helpers/logger";

export default (app: Elysia): Elysia => {
  app.onError((ctx) => {
    if (ctx.error instanceof HttpError) {
      ctx.set.status = ctx.error.statusCode;

      if (ctx.error.statusCode >= 500) {
        logger.error(ctx.error.message, ctx.error.details);
      } else {
        logger.warn(ctx.error.message, ctx.error.details);
      }
    } else if (!["VALIDATION", "NOT_FOUND", "PARSE"].includes(ctx.code)) {
      Object.assign(ctx.error, {
        message: "Internal server error",
      });
    }

    ctx.store = { ...ctx.store, error: ctx.error };
  });

  return app;
};
