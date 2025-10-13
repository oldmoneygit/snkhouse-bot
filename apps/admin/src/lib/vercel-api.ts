/**
 * Vercel API Client
 *
 * Integrates with Vercel API to fetch:
 * - Deployment logs
 * - Build logs
 * - Runtime logs
 * - Deployment status
 * - Analytics data
 *
 * Docs: https://vercel.com/docs/rest-api
 */

const VERCEL_API_BASE = "https://api.vercel.com";

interface VercelLogEntry {
  timestamp: number;
  message: string;
  type: "stdout" | "stderr" | "info" | "error" | "warning";
  source?: string;
  deploymentId?: string;
}

interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: "BUILDING" | "READY" | "ERROR" | "CANCELED";
  target: "production" | "staging";
  meta?: Record<string, any>;
}

interface VercelAPIError {
  error: {
    code: string;
    message: string;
  };
}

class VercelAPIClient {
  private token: string;
  private projectId: string;
  private teamId: string;

  constructor() {
    const token = process.env.VERCEL_API_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!token) {
      throw new Error("VERCEL_API_TOKEN not found in environment variables");
    }
    if (!projectId) {
      throw new Error("VERCEL_PROJECT_ID not found in environment variables");
    }
    if (!teamId) {
      throw new Error("VERCEL_TEAM_ID not found in environment variables");
    }

    this.token = token;
    this.projectId = projectId;
    this.teamId = teamId;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${VERCEL_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: VercelAPIError = await response.json();
      throw new Error(
        `Vercel API Error: ${error.error?.code} - ${error.error?.message}`,
      );
    }

    return response.json();
  }

  /**
   * Get recent deployments
   */
  async getDeployments(limit = 10): Promise<VercelDeployment[]> {
    const data = await this.fetch<{ deployments: VercelDeployment[] }>(
      `/v6/deployments?projectId=${this.projectId}&teamId=${this.teamId}&limit=${limit}`,
    );
    return data.deployments;
  }

  /**
   * Get deployment by ID
   */
  async getDeployment(deploymentId: string): Promise<VercelDeployment> {
    return this.fetch<VercelDeployment>(
      `/v13/deployments/${deploymentId}?teamId=${this.teamId}`,
    );
  }

  /**
   * Get build logs for deployment
   */
  async getBuildLogs(deploymentId: string): Promise<VercelLogEntry[]> {
    const data = await this.fetch<any>(
      `/v2/deployments/${deploymentId}/events?teamId=${this.teamId}`,
    );

    // Transform Vercel log format to our format
    return (data || []).map((event: any) => ({
      timestamp: event.created || Date.now(),
      message: event.text || event.payload?.text || "",
      type: this.detectLogType(event.text || ""),
      source: "build",
      deploymentId,
    }));
  }

  /**
   * Get runtime logs (last 24h)
   */
  async getRuntimeLogs(limit = 100): Promise<VercelLogEntry[]> {
    try {
      // Note: Runtime logs require Pro plan or above
      // For free tier, we'll return empty array
      const data = await this.fetch<any>(
        `/v2/projects/${this.projectId}/logs?teamId=${this.teamId}&limit=${limit}`,
      );

      return (data.logs || []).map((log: any) => ({
        timestamp: log.timestamp || Date.now(),
        message: log.message || "",
        type: this.detectLogType(log.message || ""),
        source: "runtime",
      }));
    } catch (error: any) {
      // If runtime logs not available (free tier), return empty
      if (error.message.includes("upgrade") || error.message.includes("plan")) {
        console.warn("⚠️ Runtime logs require Vercel Pro plan");
        return [];
      }
      throw error;
    }
  }

  /**
   * Get deployment analytics
   */
  async getAnalytics(since?: number): Promise<any> {
    const sinceParam = since || Date.now() - 24 * 60 * 60 * 1000; // Last 24h

    try {
      return await this.fetch<any>(
        `/v1/analytics?projectId=${this.projectId}&teamId=${this.teamId}&since=${sinceParam}`,
      );
    } catch (error: any) {
      console.warn("⚠️ Analytics may require Vercel Pro plan");
      return null;
    }
  }

  /**
   * Detect log type from message content
   */
  private detectLogType(message: string): VercelLogEntry["type"] {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("error") || lowerMessage.includes("failed")) {
      return "error";
    }
    if (lowerMessage.includes("warn")) {
      return "warning";
    }
    if (lowerMessage.includes("info")) {
      return "info";
    }

    // Default based on content
    return "stdout";
  }

  /**
   * Get aggregated logs (build + runtime)
   */
  async getAllLogs(limit = 50): Promise<VercelLogEntry[]> {
    try {
      // Get latest deployment
      const deployments = await this.getDeployments(1);
      if (deployments.length === 0) {
        return [];
      }

      const latestDeployment = deployments[0];
      if (!latestDeployment) {
        return [];
      }

      // Get build logs
      const buildLogs = await this.getBuildLogs(latestDeployment.uid);

      // Get runtime logs (may be empty on free tier)
      const runtimeLogs = await this.getRuntimeLogs(limit);

      // Combine and sort by timestamp
      const allLogs = [...buildLogs, ...runtimeLogs]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);

      return allLogs;
    } catch (error) {
      console.error("❌ Error fetching Vercel logs:", error);
      return [];
    }
  }
}

// Export singleton instance
export const vercelAPI = new VercelAPIClient();

// Export types
export type { VercelLogEntry, VercelDeployment };
