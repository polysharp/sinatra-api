import { Elysia, t } from "elysia";

import { models } from "@/database/models";
import { authMiddleware } from "@/hooks/auth.handler";

import {
  createSiteService,
  getSiteByIdService,
  getSitesService,
} from "./site.service";

const { site } = models.site.select;

export default new Elysia().group("/sites", (app) => {
  app
    .derive(authMiddleware)
    .post(
      "/",
      async ({ user, set, body }) => {
        const siteCreated = await createSiteService({
          userId: user.id,
          ...body,
        });

        set.status = 201;
        return siteCreated;
      },
      {
        body: t.Object({
          workspaceId: site.workspaceId,
          domainId: site.domainId,
          apiKeyId: site.apiKeyId,
        }),
      },
    )
    .get(
      "/",
      async ({ user, query: { workspaceId } }) => {
        const sites = await getSitesService(workspaceId, user.id);

        return sites;
      },
      {
        query: t.Object({
          workspaceId: site.workspaceId,
        }),
      },
    )
    .get(
      "/:siteId",
      async ({ user, query: { workspaceId }, params: { siteId } }) => {
        const sites = await getSiteByIdService(siteId, workspaceId, user.id);

        return sites;
      },
      {
        params: t.Object({
          siteId: site.id,
        }),
        query: t.Object({
          workspaceId: site.workspaceId,
        }),
      },
    );

  return app;
});
