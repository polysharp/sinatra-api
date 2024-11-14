import { Elysia } from "elysia";

import createSite from "./create-site";

export default new Elysia({ prefix: "/sites" }).use(createSite);
