import { Elysia, t } from "elysia";

import { models } from "@/database/models";
import authGuard from "@/hooks/auth.guard";
import { authMiddleware } from "@/hooks/auth.handler";

import SiteService from "./site.service";

const { site } = models.site.select;

export default new Elysia().group("/sites", (app) => {
  app
    .derive(authMiddleware)
    .guard(authGuard)
    .post(
      "/",
      async ({ user, set, body }) => {
        const siteCreated = await SiteService.createSite({
          userId: user.id,
          ...body,
        });

        set.status = 201;
        return siteCreated;
      },
      {
        body: t.Object({
          name: site.name,
          workspaceId: site.workspaceId,
          domainId: site.domainId,
          apiKeyId: site.apiKeyId,
        }),
      },
    )
    .get(
      "/",
      async ({ user, query: { workspaceId } }) => {
        const sites = await SiteService.getSites(workspaceId, user.id);

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
        const sites = await SiteService.getSiteById(
          siteId,
          workspaceId,
          user.id,
        );

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
    )
    .put(
      "/:siteId",
      async ({
        user,
        params: { siteId },
        body: { workspaceId, apiKeyId, name },
      }) => {
        const updatedSite = await SiteService.updateSiteById({
          siteId,
          userId: user.id,
          workspaceId,
          updateData: {
            name,
            apiKeyId,
          },
        });

        return updatedSite;
      },
      {
        params: t.Object({
          siteId: site.id,
        }),
        body: t.Object({
          name: t.Optional(site.name),
          workspaceId: site.workspaceId,
          apiKeyId: t.Optional(site.apiKeyId),
        }),
      },
    )
    .patch(
      "/:siteId/toggle-enabled",
      async ({ user, params: { siteId }, query: { workspaceId } }) => {
        const updatedSite = await SiteService.toggleSiteEnabledStatus(
          siteId,
          workspaceId,
          user.id,
        );

        return updatedSite;
      },
      {
        params: t.Object({
          siteId: site.id,
        }),
        query: t.Object({
          workspaceId: site.workspaceId,
        }),
      },
    )
    .delete(
      "/:siteId",
      async ({ user, params: { siteId }, query: { workspaceId } }) => {
        return await SiteService.deleteSiteById(siteId, workspaceId, user.id);
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
