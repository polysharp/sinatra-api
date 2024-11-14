import { Elysia } from "elysia";

import createSite from "./create-site";
import verifyDns from "./verify-dns";

export default new Elysia({ prefix: "/sites" }).use(createSite).use(verifyDns);
