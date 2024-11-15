import { Elysia, error, t } from "elysia";

import authHandler from "../../hooks/auth.handler";
import { createSiteService, verifyDnsService } from "./site.service";
import { models } from "../../database/models";

const { site } = models.site.insert;

export default new Elysia().group("/sites", (app) => {
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
                const siteCreated = await createSiteService({
                    userId: user.id,
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
                customerId: site.customerId,
                domain: site.domain,
                apiKey: site.apiKey,
            }),
        }).patch("/verify-dns", async ({ user, set, body: { siteId } }) => {
            try {
                const result = await verifyDnsService({
                    siteId,
                    userId: user.id,
                });
                set.status = 200;
                return result;
            } catch (err) {
                console.error(err);
                return error(400);
            }
        }, {
            body: t.Object({
                siteId: t.Number({ minimum: 1 }),
            }),
        });
    return app;
});
