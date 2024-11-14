import { Elysia } from "elysia";

import getUser from "./get-user";
import getUsers from "./get-users";
import createUser from "./create-user";

export default new Elysia({ prefix: "/users" })
    .use(getUsers).use(getUser).use(createUser);
