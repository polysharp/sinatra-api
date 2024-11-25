import { Elysia } from "elysia";

import apiKeyController from "./api/api-keys/api-key.controller";
import authController from "./api/auth/auth.controller";
import domainController from "./api/domains/domain.controller";
import sitesController from "./api/sites/site.controller";
import userController from "./api/users/user.controller";
import workspaceController from "./api/workspaces/workspaces.controller";

export default new Elysia()
  .use(apiKeyController)
  .use(authController)
  .use(domainController)
  .use(userController)
  .use(sitesController)
  .use(workspaceController);
