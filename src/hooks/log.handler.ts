import Elysia from "elysia";

import config from "@/config";
import { HttpError } from "@/helpers/HttpError";
import logger from "@/helpers/logger";

function formatDuration(durationInMilliseconds: number): string {
  if (durationInMilliseconds >= 1000) {
    return `${(durationInMilliseconds / 1000).toPrecision(3)}s`;
  }

  return `${durationInMilliseconds}ms`;
}

export default (app: Elysia): Elysia => {
  app
    .derive((ctx) => {
      const clientIP = app.server
        ? app.server.requestIP(ctx.request)?.address
        : undefined;
      return { ip: clientIP };
    })
    .onRequest((ctx) => {
      ctx.store = {
        requestStart: Date.now(),
        requestMethod: ctx.request.method,
        ...ctx.store,
      };
    })
    .onAfterResponse((ctx) => {
      const store = ctx.store as {
        requestStart: number;
        requestMethod: string;
        error: (Error & HttpError) | undefined;
      };
      let duration: string = "unknown";

      if (store.requestStart) {
        duration = formatDuration(
          Date.now() - (ctx.store as { requestStart: number }).requestStart,
        );
      }

      const logPayload = {
        method: store.requestMethod,
        path: ctx.path,
        params: ctx.params,
        status: ctx.set.status,
        duration,
        ip: ctx.ip,
      };

      if (store.error) {
        Object.assign(logPayload, {
          error: {
            message: store.error.message,
            details: store.error.details,
            stack:
              config.NODE_ENV === "development" ? store.error.stack : undefined,
          },
        });
      }

      logger.http(
        `${store.requestMethod} ${ctx.path} - ${ctx.set.status} - ${duration}`,
        logPayload,
      );
    });

  return app;
};
