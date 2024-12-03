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
    );

  return app;
});
