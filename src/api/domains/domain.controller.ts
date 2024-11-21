import Elysia, { error, t } from "elysia";

import { models } from "@/database/models";
import { authMiddleware } from "@/hooks/auth.handler";

import { createDomainService } from "./domain.service";

const { domain } = models.domain.insert;

export default new Elysia().group("/domains", (app) => {
  app.derive(authMiddleware).post(
    "/",
    async ({ user, body: { name: domainName, workspaceId } }) => {
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
        workspaceId: domain.workspaceId,
      }),
    },
  );

  return app;
});
