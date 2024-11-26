import { Elysia } from "elysia";

import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";

import config from "./config";
import logger from "./helpers/logger";
import errorHandler from "./hooks/error.handler";
import logHandler from "./hooks/log.handler";
import router from "./router";

new Elysia()
  .use(errorHandler)
  .use(logHandler)
  .use(cors())
  .use(swagger())
  .use(router)
  .onStart(({ server }) =>
    logger.info(
      "🦊 Elysia is up and running at" +
        `http://${server?.hostname}:${server?.port} 🚀 ` +
        `(Environment: ${config.NODE_ENV.toUpperCase()})`,
    ),
  )
  .listen({ hostname: config.HOST, port: config.PORT });
