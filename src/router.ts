import { Elysia } from "elysia";

import authController from "./api/auth/auth.controller";
import userController from "./api/users/user.controller";
import customerController from "./api/customers/customer.controller";
import sitesController from "./api/sites/site.controller";

export default new Elysia()
    .use(authController)
    .use(userController)
    .use(customerController)
    .use(sitesController);
