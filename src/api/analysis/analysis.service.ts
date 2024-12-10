import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import fetch from "node-fetch";
import { z } from "zod";

import config from "@/config";
import db from "@/database/database";
import schemas from "@/database/schemas";
import { decrypt } from "@/helpers/crypto";
import { Forbidden, InternalServerError } from "@/helpers/HttpError";
import logger from "@/helpers/logger";
import { calculateTimeDifferenceInSeconds } from "@/helpers/time.helper";

import ApiKeyService from "../api-keys/api-key.service";
import DomainService from "../domains/domain.service";
import SiteService from "../sites/site.service";
import WorkspaceUserService from "../workspace-users/workspace-users.service";

export default abstract class AnalysisService {
  /**
   * Analyzes a site by its ID.
   * @param siteId - The ID of the site to analyze.
   * @param workspaceId - The ID of the workspace.
   * @param userId - The ID of the user.
   * @returns The created analysis.
   * @throws {Forbidden} If the user does not belong to the workspace or the site is disabled or the domain is not verified.
   * @throws {BadRequest} If the API key or domain does not exist.
   */
  public static async analyseSiteById(
    siteId: string,
    workspaceId: string,
    userId: string,
  ) {
    const { plainApiKey, domain } = await this.validateSiteAndDependencies(
      siteId,
      workspaceId,
      userId,
    );

    const analysis = await this.createPendingAnalysis(siteId);

    this.triggerAnalysis(
      analysis.id,
      siteId,
      workspaceId,
      userId,
      domain.name,
      plainApiKey,
    ).catch((error) => {
      logger.error("Analysis execution failed", {
        siteId,
        workspaceId,
        error,
      });
    });

    return analysis;
  }

  /**
   * Retrieves analyses for a specific site within a workspace, filtered by various options.
   * If the site ID is not provided, analyses for all sites within the workspace are retrieved.
   * @param siteId - The ID of the site to retrieve analyses for.
   * @param workspaceId - The ID of the workspace the site belongs to.
   * @param userId - The ID of the user requesting the analyses.
   * @param options - Filtering options for the analyses.
   * @returns A promise that resolves to an array of analyses.
   * @throws {Forbidden} - If the workspace does not belong to the user.
   * @throws {BadRequest} - If the site does not exist
   */
  public static async getAnalysesBySiteId(
    siteId: string | undefined,
    workspaceId: string,
    userId: string,
    options: {
      offset?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      status?: Array<"PENDING" | "SUCCESS" | "FAILED">;
    },
  ) {
    await WorkspaceUserService.workspaceBelongsToUser(workspaceId, userId);

    let conditions = [];

    if (siteId) {
      const site = await SiteService.getSiteById(siteId, workspaceId, userId);
      conditions.push(eq(schemas.analysis.siteId, site.id));
    } else {
      const sites = await SiteService.getSitesByWorkspaceId(
        workspaceId,
        userId,
      );
      const siteIds = sites.map((site) => site.id);

      if (siteIds.length === 0) {
        return [];
      }

      conditions.push(inArray(schemas.analysis.siteId, siteIds));
    }

    if (options.status && options.status.length > 0) {
      conditions.push(inArray(schemas.analysis.status, options.status));
    }

    if (options.startDate) {
      conditions.push(
        gte(schemas.analysis.updatedAt, new Date(options.startDate)),
      );
    }
    if (options.endDate) {
      conditions.push(
        lte(schemas.analysis.updatedAt, new Date(options.endDate)),
      );
    }

    const query = db
      .select()
      .from(schemas.analysis)
      .where(and(...conditions))
      .orderBy(desc(schemas.analysis.updatedAt));

    if (options.limit) {
      query.limit(options.limit);
    }
    if (options.offset) {
      query.offset(options.offset);
    }

    const analyses = await query.execute();

    return analyses;
  }

  /**
   * Validates the site and its dependencies.
   * @param siteId - The ID of the site.
   * @param workspaceId - The ID of the workspace.
   * @param userId - The ID of the user.
   * @returns An object containing the site, decrypted API key, and domain.
   * @throws {Forbidden} If the user does not belong to the workspace or the site is disabled or the domain is not verified.
   * @throws {BadRequest} If the API key or domain does not exist.
   */
  private static async validateSiteAndDependencies(
    siteId: string,
    workspaceId: string,
    userId: string,
  ) {
    await WorkspaceUserService.workspaceBelongsToUser(workspaceId, userId);

    const site = await SiteService.getSiteById(siteId, workspaceId, userId);
    if (!site.enabled) {
      throw new Forbidden("Site is disabled");
    }

    const apiKey = await ApiKeyService.apiKeyExists(site.apiKeyId, workspaceId);
    const domain = await DomainService.domainExists(site.domainId, workspaceId);

    if (domain.verificationStatus !== "VERIFIED") {
      throw new Forbidden("Domain is not verified");
    }

    return { site, plainApiKey: decrypt(apiKey.value), domain };
  }

  /**
   * Creates a pending analysis for a site.
   * @param siteId - The ID of the site.
   * @returns The created analysis.
   */
  private static async createPendingAnalysis(siteId: string) {
    const [analysis] = await db
      .insert(schemas.analysis)
      .values({
        siteId,
        status: "PENDING",
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
      })
      .returning();

    return analysis;
  }

  /**
   * Triggers the analysis process.
   * @param analysisId - The ID of the analysis.
   * @param siteId - The ID of the site.
   * @param workspaceId - The ID of the workspace.
   * @param userId - The ID of the user.
   * @param domainName - The name of the domain.
   * @param decryptedApiKey - The decrypted API key.
   */
  private static async triggerAnalysis(
    analysisId: string,
    siteId: string,
    workspaceId: string,
    userId: string,
    domainName: string,
    decryptedApiKey: string,
  ) {
    const { SUPABASE_URL, SUPABASE_SECRET } = config;

    const body = {
      url: `https://${domainName}`,
      apiKey: decryptedApiKey,
      categories: ["performance", "accessibility", "best-practices", "seo"],
    };

    const startTime = Date.now();

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze`, {
        method: "POST",
        headers: {
          Authorization: SUPABASE_SECRET,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new InternalServerError("Failed to start analysis");
      }

      const result = await response.json();
      const validData = this.validateAnalysisResult(result);

      await db
        .update(schemas.analysis)
        .set({ status: "SUCCESS", ...validData })
        .where(eq(schemas.analysis.id, analysisId));

      const endTime = Date.now();

      logger.info("Site analysis completed", {
        analysisId,
        siteId,
        workspaceId,
        userId,
        result: validData,
        durationInSeconds: calculateTimeDifferenceInSeconds(startTime, endTime),
      });
    } catch (error) {
      await db
        .update(schemas.analysis)
        .set({ status: "FAILED" })
        .where(eq(schemas.analysis.id, analysisId));

      const endTime = Date.now();

      logger.error("Error during analysis request", {
        analysisId,
        siteId,
        workspaceId,
        userId,
        error,
        durationInSeconds: calculateTimeDifferenceInSeconds(startTime, endTime),
      });
    }
  }

  /**
   * Validates the analysis result.
   * @param result - The result of the analysis.
   * @returns The validated analysis data.
   * @throws {InternalServerError} If the response format is invalid.
   */
  private static validateAnalysisResult(result: any) {
    const schema = z.object({
      performance: z.number().min(0),
      accessibility: z.number().min(0),
      bestPractices: z.number().min(0),
      seo: z.number().min(0),
    });

    const validation = schema.safeParse(result);
    if (!validation.success) {
      logger.error("Invalid response format from analyze Edge function");
      throw new InternalServerError("Invalid response format");
    }

    return validation.data;
  }
}
