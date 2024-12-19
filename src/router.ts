import { Elysia } from "elysia";

import analysisController from "./api/analysis/analysis.controller";
import apiKeyController from "./api/api-keys/api-key.controller";
import authController from "./api/auth/auth.controller";
import domainController from "./api/domains/domain.controller";
import siteController from "./api/sites/site.controller";
import userController from "./api/users/user.controller";
import workspaceController from "./api/workspaces/workspaces.controller";
import config from "./config";

export default new Elysia({ prefix: config.API_PREFIX })
  .use(analysisController)
  .use(apiKeyController)
  .use(authController)
  .use(domainController)
  .use(siteController)
  .use(userController)
  .use(workspaceController);
