import { Elysia } from "elysia";

import createCustomer from "./create-customer";
import getCustomers from "./get-customers";

export default new Elysia({ prefix: "/customers" })
    .use(createCustomer).use(getCustomers);
