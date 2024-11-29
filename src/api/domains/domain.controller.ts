import Elysia, { t } from "elysia";

import { models } from "@/database/models";
import authGuard from "@/hooks/auth.guard";
import { authMiddleware } from "@/hooks/auth.handler";

import DomainService from "./domain.service";

const { domain } = models.domain.select;

export default new Elysia().group("/domains", (app) => {
  app
    .derive(authMiddleware)
    .guard(authGuard)
    .post(
      "/",
      async ({ user, body: { name: domainName, workspaceId } }) => {
        const domainCreated = await DomainService.createDomain({
          userId: user.id,
          workspaceId,
          domainName,
        });

        return domainCreated;
      },
      {
        body: t.Object({
          name: domain.name,
          workspaceId: domain.workspaceId,
        }),
      },
    )
    .get(
      "/",
      async ({ user, query: { workspaceId } }) => {
        const domainsFromDb = await DomainService.getUserWorkspaceDomains(
          user.id,
          workspaceId,
        );

        return domainsFromDb;
      },
      {
        query: t.Object({
          workspaceId: domain.workspaceId,
        }),
      },
    )
    .patch(
      "/:domainId/verify",
      async ({ user, params: { domainId } }) => {
        const domainUpdated = await DomainService.verifyDns(domainId, user.id);

        return domainUpdated;
      },
      {
        params: t.Object({
          domainId: domain.id,
        }),
      },
    );

  return app;
});
