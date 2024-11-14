import { Elysia } from "elysia";

import userRoutes from "./api/users/user.routes";
import customerRoutes from "./api/customers/customer.routes";
import sitesRoutes from "./api/sites/sites.routes";

export default new Elysia()
    .use(userRoutes).use(customerRoutes).use(sitesRoutes);
