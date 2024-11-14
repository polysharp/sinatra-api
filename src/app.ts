import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";

import router from "./router";

new Elysia()
  .use(swagger())
  .use(router)
  .onStart(({ server }) =>
    console.log(
      `🦊 Elysia is running at ${server?.hostname}:${server?.port}`,
    )
  )
  .listen(3000);
