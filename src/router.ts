import { Elysia } from "elysia";

import authController from "./api/auth/auth.controller";
import workspaceController from "./api/workspaces/workspaces.controller";
import sitesController from "./api/sites/site.controller";
import userController from "./api/users/user.controller";

export default new Elysia()
    .use(authController)
    .use(userController)
    .use(workspaceController)
    .use(sitesController);
