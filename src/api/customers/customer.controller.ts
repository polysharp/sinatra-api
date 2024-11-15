import { Elysia, error, t } from "elysia";

import authHandler from "../../hooks/auth.handler";
import { models } from "../../database/models";
import {
    createCustomerService,
    getCustomersWithEmail,
} from "./customer.service";

const { customer } = models.customer.insert;

export default new Elysia().group("/customers", (app) => {
    app
        .derive(async ({ headers: { authorization } }) => {
            const user = await authHandler(authorization);
            if (!user) {
                return error("Unauthorized");
            }

            return {
                user: {
                    id: user.userId,
                    email: user.email,
                },
            };
        })
        .post("/", async ({ user, set, body }) => {
            try {
                const siteCreated = await createCustomerService({
                    email: user.email,
                    ...body,
                });

                set.status = 201;
                return siteCreated;
            } catch (err) {
                console.error(err);
                return error(400);
            }
        }, {
            body: t.Object({
                domain: customer.domain,
                name: customer.name,
            }),
        }).get("/", async ({ user }) => {
            try {
                const customersFromDb = await getCustomersWithEmail(user.email);

                return customersFromDb;
            } catch (err) {
                console.error(err);
                return error(404);
            }
        });
    return app;
});
