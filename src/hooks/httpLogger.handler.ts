import Elysia from "elysia";

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
    .onError((ctx) => {
      ctx.store = { error: ctx.error, ...ctx.store };
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
        error: Error | undefined;
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
        error: store.error || undefined,
      };

      logger.http(
        `${store.requestMethod} ${ctx.path} - ${ctx.set.status} - ${duration}`,
        logPayload,
      );
    });

  return app;
};
