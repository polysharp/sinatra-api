import { and, eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { encrypt } from "@/helpers/crypto";
import { BadRequest } from "@/helpers/HttpError";

import WorkspaceUserService from "../workspace-users/workspace-users.service";

type CreateApiKeyInput = {
  name: string;
  value: string;
  userId: string;
  workspaceId: string;
};

export default abstract class ApiKeyService {
  /**
   * Creates a new API Key associated with a workspace.
   * @param payload {CreateApiKeyInput} Object containing API key details.
   * @returns The newly created API Key.
   */
  static async createApiKey(payload: CreateApiKeyInput) {
    const { userId, workspaceId, name, value } = payload;

    await WorkspaceUserService.workspaceBelongsToUser(workspaceId, userId);

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
  }

  /**
   * Retrieves all API keys for a user within a workspace.
   * @param userId {string} User's ID.
   * @param workspaceId {string} Workspace's ID.
   * @returns List of API keys for the workspace.
   */
  static async getUserWorkspaceApiKeys(userId: string, workspaceId: string) {
    await WorkspaceUserService.workspaceBelongsToUser(workspaceId, userId);

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
  }

  /**
   * Checks if an API key exists for a specific workspace.
   * @param apiKeyId {string} The ID of the API key.
   * @param workspaceId {string} Workspace's ID.
   * @throws {BadRequest} If the API key does not exist.
   */
  static async apiKeyExists(apiKeyId: string, workspaceId: string) {
    const apiKey = await db
      .select()
      .from(schemas.apiKey)
      .where(
        and(
          eq(schemas.apiKey.id, apiKeyId),
          eq(schemas.apiKey.workspaceId, workspaceId),
        ),
      );

    if (!apiKey.length) {
      throw new BadRequest("API Key does not exist");
    }
  }
}
