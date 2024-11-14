import { customer } from "./schemas/customer.schema";
import { sites } from "./schemas/sites.schema";
import { userCustomers } from "./schemas/user-customers.schema";
import { user } from "./schemas/user.schema";

export default {
    userCustomers,
    customer,
    user,
    sites,
} as const;
