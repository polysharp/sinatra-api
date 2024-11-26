import { eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { encrypt } from "@/helpers/crypto";

import { workspaceBelongsToUser } from "../workspace-users/workspace-users.service";

type CreateApiKeyInput = {
  name: string;
  value: string;
  userId: string;
  workspaceId: string;
};

export const createApiKey = async (payload: CreateApiKeyInput) => {
  const { userId, workspaceId, name, value } = payload;

  await workspaceBelongsToUser(workspaceId, userId);

  const cipheredValue = encrypt(value);

  const [apiKey] = await db
    .insert(schemas.apiKey)
    .values({
      workspaceId,
      name,
      value: cipheredValue,
    })
    .returning({
      id: schemas.apiKey.id,
      name: schemas.apiKey.name,
      workspaceId: schemas.apiKey.workspaceId,
      createdAt: schemas.apiKey.createdAt,
      updatedAt: schemas.apiKey.updatedAt,
    });

  return apiKey;
};

export const getUserWorkspaceApiKeys = async (
  userId: string,
  workspaceId: string,
) => {
  await workspaceBelongsToUser(workspaceId, userId);

  const apiKeys = await db
    .select({
      id: schemas.apiKey.id,
      name: schemas.apiKey.name,
      workspaceId: schemas.apiKey.workspaceId,
      createdAt: schemas.apiKey.createdAt,
      updatedAt: schemas.apiKey.updatedAt,
    })
    .from(schemas.apiKey)
    .where(eq(schemas.apiKey.workspaceId, workspaceId));

  return apiKeys;
};
