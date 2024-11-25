import { Elysia } from "elysia";

import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";

import config from "./config";
import logger from "./helpers/logger";
import httpLogger from "./hooks/httpLogger.handler";
import router from "./router";

new Elysia()
  .use(httpLogger)
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
