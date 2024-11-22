import { Elysia } from "elysia";

import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";

import config from "./config";
import router from "./router";

new Elysia()
  .use(cors())
  .use(swagger())
  .use(router)
  .onStart(({ server }) =>
    console.log(`🦊 Elysia is running at ${server?.hostname}:${server?.port}`),
  )
  .listen({ hostname: config.HOST, port: config.PORT });
