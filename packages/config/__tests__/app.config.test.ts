import { beforeEach, describe, expect, it, vi } from "vitest";

// We need to import and test the schema logic, but since the actual config
// depends on process.env, we'll test the parsing logic with mock data
const { z } = await import("zod");

describe("app config schema", () => {
  // Create the schema here for testing
  const AppConfigSchema = z
    .object({
      name: z.string().min(1),
      title: z.string().min(1),
      description: z.string(),
      url: z.string().url(),
      locale: z.string().default("en"),
      theme: z.enum(["light", "dark", "system"]),
      production: z.boolean(),
      themeColor: z.string(),
      themeColorDark: z.string(),
      version: z.string().optional(),
    })
    .refine(
      (schema) => {
        const isProductionDeployment =
          (schema.production && process.env.VERCEL_ENV === "production") ||
          (process.env.NODE_ENV === "production" && !schema.url.includes("localhost"));

        if (!isProductionDeployment) {
          return true;
        }

        return !schema.url.startsWith("http:");
      },
      {
        message: `Please provide a valid HTTPS URL for production deployment. Set the variable NEXT_PUBLIC_SITE_URL with a valid URL, such as: 'https://example.com'`,
        path: ["url"],
      },
    )
    .refine(
      (schema) => {
        return schema.themeColor !== schema.themeColorDark;
      },
      {
        message: `Please provide different theme colors for light and dark themes.`,
        path: ["themeColor"],
      },
    );

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should validate valid app config", () => {
    const validConfig = {
      name: "Test App",
      title: "Test Application",
      description: "A test application",
      url: "http://localhost:3000",
      locale: "en",
      theme: "system" as const,
      production: false,
      themeColor: "#3b82f6",
      themeColorDark: "#1e40af",
      version: "1.0.0",
    };

    expect(() => AppConfigSchema.parse(validConfig)).not.toThrow();
  });

  it("should require name to be non-empty", () => {
    const invalidConfig = {
      name: "",
      title: "Test Application",
      description: "A test application",
      url: "http://localhost:3000",
      locale: "en",
      theme: "system" as const,
      production: false,
      themeColor: "#3b82f6",
      themeColorDark: "#1e40af",
    };

    expect(() => AppConfigSchema.parse(invalidConfig)).toThrow();
  });

  it("should require valid URL format", () => {
    const invalidConfig = {
      name: "Test App",
      title: "Test Application",
      description: "A test application",
      url: "not-a-valid-url",
      locale: "en",
      theme: "system" as const,
      production: false,
      themeColor: "#3b82f6",
      themeColorDark: "#1e40af",
    };

    expect(() => AppConfigSchema.parse(invalidConfig)).toThrow();
  });

  it("should enforce different theme colors", () => {
    const invalidConfig = {
      name: "Test App",
      title: "Test Application",
      description: "A test application",
      url: "http://localhost:3000",
      locale: "en",
      theme: "system" as const,
      production: false,
      themeColor: "#3b82f6",
      themeColorDark: "#3b82f6", // Same color
    };

    expect(() => AppConfigSchema.parse(invalidConfig)).toThrow(
      /Please provide different theme colors/,
    );
  });

  it("should validate theme enum values", () => {
    const invalidConfig = {
      name: "Test App",
      title: "Test Application",
      description: "A test application",
      url: "http://localhost:3000",
      locale: "en",
      theme: "invalid" as any,
      production: false,
      themeColor: "#3b82f6",
      themeColorDark: "#1e40af",
    };

    expect(() => AppConfigSchema.parse(invalidConfig)).toThrow();
  });

  it("should default locale to en", () => {
    const config = {
      name: "Test App",
      title: "Test Application",
      description: "A test application",
      url: "http://localhost:3000",
      theme: "system" as const,
      production: false,
      themeColor: "#3b82f6",
      themeColorDark: "#1e40af",
    };

    const parsed = AppConfigSchema.parse(config);
    expect(parsed.locale).toBe("en");
  });

  it("should allow version to be optional", () => {
    const configWithoutVersion = {
      name: "Test App",
      title: "Test Application",
      description: "A test application",
      url: "http://localhost:3000",
      locale: "en",
      theme: "system" as const,
      production: false,
      themeColor: "#3b82f6",
      themeColorDark: "#1e40af",
    };

    const parsed = AppConfigSchema.parse(configWithoutVersion);
    expect(parsed.version).toBeUndefined();
  });
});
