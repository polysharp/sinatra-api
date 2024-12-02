import { and, eq } from "drizzle-orm";

import db from "@/database/database";
import schemas from "@/database/schemas";
import { encrypt } from "@/helpers/crypto";
import { BadRequest, Forbidden } from "@/helpers/HttpError";

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
   * @throws {Forbidden} If the workspace does not belong to the user.
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
   * @throws {Forbidden} If the workspace does not belong to the user.
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
   * @throws {BadRequest} If the API key does not exist for the given workspace.
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

  /**
   * Updates an existing API key.
   * @param apiKeyId {string} The ID of the API key to update.
   * @param userId {string} The ID of the user requesting the update.
   * @param workspaceId {string} Workspace's ID.
   * @param updateData {Partial<CreateApiKeyInput>} Data to update the API key with.
   * @returns The updated API key.
   * @throws {BadRequest} If the API key does not exist.
   * @throws {Forbidden} If the workspace does not belong to the user or the user is not an ADMIN.
   */
  static async updateApiKey(
    apiKeyId: string,
    userId: string,
    workspaceId: string,
    updateData: Partial<CreateApiKeyInput>,
  ) {
    const userRole = await WorkspaceUserService.getUserRoleInWorkspace(
      workspaceId,
      userId,
    );

    if (userRole !== "ADMIN") {
      throw new Forbidden("User does not have permission to delete API key");
    }

    await this.apiKeyExists(apiKeyId, workspaceId);

    if (updateData.value) {
      updateData.value = encrypt(updateData.value);
    }

    const [updatedApiKey] = await db
      .update(schemas.apiKey)
      .set(updateData)
      .where(
        and(
          eq(schemas.apiKey.id, apiKeyId),
          eq(schemas.apiKey.workspaceId, workspaceId),
        ),
      )
      .returning({
        id: schemas.apiKey.id,
        name: schemas.apiKey.name,
        workspaceId: schemas.apiKey.workspaceId,
        createdAt: schemas.apiKey.createdAt,
        updatedAt: schemas.apiKey.updatedAt,
      });

    return updatedApiKey;
  }

  /**
   * Deletes an API key if the requesting user has the ADMIN role.
   * @param apiKeyId {string} The ID of the API key to delete.
   * @param userId {string} The ID of the user requesting the deletion.
   * @param workspaceId {string} Workspace's ID.
   * @throws {Forbidden} If the workspace does not belong to the user.
   * @throws {Forbidden} If the user is not an ADMIN or the API key does not exist.
   */
  static async deleteApiKey(
    apiKeyId: string,
    userId: string,
    workspaceId: string,
  ) {
    const userRole = await WorkspaceUserService.getUserRoleInWorkspace(
      workspaceId,
      userId,
    );

    if (userRole !== "ADMIN") {
      throw new Forbidden("User does not have permission to delete API key");
    }

    await this.apiKeyExists(apiKeyId, workspaceId);

    await db
      .update(schemas.site)
      .set({ enabled: false })
      .where(eq(schemas.site.apiKeyId, apiKeyId));

    await db
      .delete(schemas.apiKey)
      .where(
        and(
          eq(schemas.apiKey.id, apiKeyId),
          eq(schemas.apiKey.workspaceId, workspaceId),
        ),
      );
  }
}
