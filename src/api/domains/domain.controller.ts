import Elysia, { error, t } from "elysia";

import { models } from "@/database/models";

import { createDomainService } from "./domain.service";
import { authMiddleware } from "@/hooks/auth.handler";

const { domain } = models.domain.insert;

export default new Elysia().group("/domains", (app) => {
    app
        .derive(authMiddleware)
        .post(
            "/:workspaceId",
            async (
                { user, body: { name: domainName }, params: { workspaceId } },
            ) => {
                try {
                    const domainCreated = await createDomainService({
                        userId: user.id,
                        workspaceId,
                        domainName,
                    });

                    return domainCreated;
                } catch (err) {
                    console.error(err);
                    return error(400);
                }
            },
            {
                body: t.Object({
                    name: domain.name,
                }),
                params: t.Object({
                    workspaceId: domain.workspaceId,
                }),
            },
        );

    return app;
});
