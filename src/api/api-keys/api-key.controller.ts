import Elysia, { t } from "elysia";

import { models } from "@/database/models";
import authGuard from "@/hooks/auth.guard";
import { authMiddleware } from "@/hooks/auth.handler";

import ApiKeyService from "./api-key.service";

const { apiKey } = models.apiKey.select;

export default new Elysia().group("/api-keys", (app) => {
  app
    .derive(authMiddleware)
    .guard(authGuard)
    .post(
      "/",
      async ({ user, body: { name, value, workspaceId } }) => {
        const apiKeyCreated = await ApiKeyService.createApiKey({
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
        const apiKeysFromDb = await ApiKeyService.getUserWorkspaceApiKeys(
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
    )
    .put(
      "/:apiKeyId",
      async ({
        user,
        body: { name, value },
        query: { workspaceId },
        params: { apiKeyId },
      }) => {
        const updatedApiKey = await ApiKeyService.updateApiKey(
          apiKeyId,
          user.id,
          workspaceId,
          { name, value },
        );

        return updatedApiKey;
      },
      {
        params: t.Object({
          apiKeyId: apiKey.id,
        }),
        body: t.Object({
          name: apiKey.name,
          value: apiKey.name,
        }),
        query: t.Object({
          workspaceId: apiKey.workspaceId,
        }),
      },
    )
    .delete(
      "/:apiKeyId",
      async ({ user, params: { apiKeyId }, query: { workspaceId } }) => {
        await ApiKeyService.deleteApiKey(apiKeyId, user.id, workspaceId);

        return { message: "API key deleted" };
      },
      {
        params: t.Object({
          apiKeyId: apiKey.id,
        }),
        query: t.Object({
          workspaceId: apiKey.workspaceId,
        }),
      },
    );

  return app;
});
