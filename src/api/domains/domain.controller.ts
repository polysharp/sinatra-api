import Elysia, { error, t } from "elysia";

import { models } from "@/database/models";
import { authMiddleware } from "@/hooks/auth.handler";

import {
  createDomainService,
  getUserWorkspaceDomains,
  verifyDnsService,
} from "./domain.service";

const { domain } = models.domain.select;

export default new Elysia().group("/domains", (app) => {
  app
    .derive(authMiddleware)
    .post(
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
    )
    .get(
      "/",
      async ({ user, query: { workspaceId } }) => {
        try {
          const domainsFromDb = await getUserWorkspaceDomains(
            user.id,
            workspaceId,
          );

          return domainsFromDb;
        } catch (err) {
          console.error(err);
          return error(400);
        }
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
        try {
          const domainUpdated = await verifyDnsService(domainId, user.id);

          return domainUpdated;
        } catch (err) {
          console.error(err);
          return error(400);
        }
      },
      {
        params: t.Object({
          domainId: domain.id,
        }),
      },
    );

  return app;
});
