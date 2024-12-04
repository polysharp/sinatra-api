import Elysia, { t } from "elysia";

import { models } from "@/database/models";
import authGuard from "@/hooks/auth.guard";
import { authMiddleware } from "@/hooks/auth.handler";

import AnalysisService from "./analysis.service";

const { analysis } = models.analysis.select;
const { workspace } = models.workspace.select;

export default new Elysia().group("/analyses", (app) => {
  app
    .derive(authMiddleware)
    .guard(authGuard)
    .post(
      "/",
      async ({ user, body: { siteId, workspaceId }, set }) => {
        const analysis = await AnalysisService.analyseSiteById(
          siteId,
          workspaceId,
          user.id,
        );

        set.status = 202;

        return analysis;
      },
      {
        body: t.Object({
          siteId: analysis.siteId,
          workspaceId: workspace.id,
        }),
      },
    )
    .get(
      "/",
      async ({
        user,
        query: { siteId, workspaceId, offset, limit, startDate, endDate },
      }) => {
        const analyses = await AnalysisService.getAnalysesBySiteId(
          siteId,
          workspaceId,
          user.id,
          {
            offset: offset ? parseInt(offset, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            startDate,
            endDate,
          },
        );

        return analyses;
      },
      {
        query: t.Object({
          siteId: t.String(),
          workspaceId: t.String(),
          offset: t.Optional(
            t.String({ format: "regex", pattern: "^[0-9]+$" }),
          ),
          limit: t.Optional(t.String({ format: "regex", pattern: "^[0-9]+$" })),
          startDate: t.Optional(t.String({ format: "date" })),
          endDate: t.Optional(t.String({ format: "date" })),
        }),
      },
    );

  return app;
});
