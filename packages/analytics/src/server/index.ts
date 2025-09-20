import { PostHog } from "posthog-node";
import { envs } from "../envs";

interface AnalyticsEvent {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
}

interface AnalyticsIdentify {
  distinctId: string;
  properties: Record<string, unknown>;
}

class ServerAnalyticsService {
  private posthog: PostHog | null = null;

  constructor() {
    this.initializePostHog();
  }

  private initializePostHog() {
    if (envs.NEXT_PUBLIC_POSTHOG_KEY && envs.NEXT_PUBLIC_POSTHOG_HOST) {
      this.posthog = new PostHog(envs.NEXT_PUBLIC_POSTHOG_KEY, {
        host: envs.NEXT_PUBLIC_POSTHOG_HOST,
        flushAt: 20,
        flushInterval: 10000,
      });
    }
  }

  async track(params: AnalyticsEvent): Promise<void> {
    if (!this.posthog || process.env.NODE_ENV !== "production") {
      return;
    }

    try {
      this.posthog.capture({
        distinctId: params.distinctId,
        event: params.event,
        properties: params.properties,
      });
    } catch (error) {
      console.warn("Analytics tracking error:", error);
    }
  }

  async identify(params: AnalyticsIdentify): Promise<void> {
    if (!this.posthog || process.env.NODE_ENV !== "production") {
      return;
    }

    try {
      this.posthog.identify({
        distinctId: params.distinctId,
        properties: params.properties,
      });
    } catch (error) {
      console.warn("Analytics identify error:", error);
    }
  }

  async group(params: {
    distinctId: string;
    groupType: string;
    groupKey: string;
    properties?: Record<string, unknown>;
  }): Promise<void> {
    if (!this.posthog || process.env.NODE_ENV !== "production") {
      return;
    }

    try {
      this.posthog.groupIdentify({
        groupType: params.groupType,
        groupKey: params.groupKey,
        properties: params.properties || {},
      });

      // Associate user with group
      this.posthog.capture({
        distinctId: params.distinctId,
        event: "$group_identify",
        properties: {
          $group_type: params.groupType,
          $group_key: params.groupKey,
          ...params.properties,
        },
      });
    } catch (error) {
      console.warn("Analytics group error:", error);
    }
  }

  async alias(distinctId: string, alias: string): Promise<void> {
    if (!this.posthog || process.env.NODE_ENV !== "production") {
      return;
    }

    try {
      this.posthog.alias({
        distinctId,
        alias,
      });
    } catch (error) {
      console.warn("Analytics alias error:", error);
    }
  }

  async shutdown(): Promise<void> {
    if (this.posthog) {
      await this.posthog.shutdown();
    }
  }

  // Feature flag support
  async getFeatureFlag(
    key: string,
    distinctId: string,
    options?: {
      groups?: Record<string, string>;
      personProperties?: Record<string, string>;
      groupProperties?: Record<string, Record<string, string>>;
    },
  ): Promise<boolean | string | undefined> {
    if (!this.posthog || process.env.NODE_ENV !== "production") {
      return undefined;
    }

    try {
      return await this.posthog.getFeatureFlag(key, distinctId, options);
    } catch (error) {
      console.warn("Feature flag error:", error);
      return undefined;
    }
  }

  async getAllFlags(
    distinctId: string,
    options?: {
      groups?: Record<string, string>;
      personProperties?: Record<string, string>;
      groupProperties?: Record<string, Record<string, string>>;
    },
  ): Promise<Record<string, boolean | string> | undefined> {
    if (!this.posthog || process.env.NODE_ENV !== "production") {
      return undefined;
    }

    try {
      return await this.posthog.getAllFlags(distinctId, options);
    } catch (error) {
      console.warn("Get all flags error:", error);
      return undefined;
    }
  }
}

// Singleton instance
const serverAnalytics = new ServerAnalyticsService();

export { serverAnalytics };
export type { AnalyticsEvent, AnalyticsIdentify };
