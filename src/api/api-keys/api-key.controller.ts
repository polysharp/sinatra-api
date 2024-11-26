import Elysia, { error, t } from "elysia";

import { models } from "@/database/models";
import { authMiddleware } from "@/hooks/auth.handler";

import { createApiKey, getUserWorkspaceApiKeys } from "./api-key.service";

const { apiKey } = models.apiKey.select;

export default new Elysia().group("/api-keys", (app) => {
  app
    .derive(authMiddleware)
    .post(
      "/",
      async ({ user, body: { name, workspaceId, value } }) => {
        const apiKeyCreated = await createApiKey({
          userId: user.id,
          workspaceId,
          name,
          value,
        });

        return apiKeyCreated;
      },
      {
        body: t.Object({
          name: apiKey.name,
          value: apiKey.name,
          workspaceId: apiKey.workspaceId,
        }),
      },
    )
    .get(
      "/",
      async ({ user, query: { workspaceId } }) => {
        const apiKeysFromDb = await getUserWorkspaceApiKeys(
          user.id,
          workspaceId,
        );

        return apiKeysFromDb;
      },
      {
        query: t.Object({
          workspaceId: apiKey.workspaceId,
        }),
      },
    );

  return app;
});
