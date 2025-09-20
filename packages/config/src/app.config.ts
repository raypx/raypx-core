import { z } from "zod";

const production = process.env.NODE_ENV === "production";

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
      // Only enforce HTTPS in production deployment (not local build)
      const isProductionDeployment =
        (schema.production && process.env.VERCEL_ENV === "production") ||
        (process.env.NODE_ENV === "production" && !schema.url.includes("localhost"));

      if (!isProductionDeployment) {
        return true;
      }

      // Require HTTPS only in production deployment
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

const appConfig = AppConfigSchema.parse({
  name: process.env.NEXT_PUBLIC_PRODUCT_NAME ?? process.env.NEXT_PUBLIC_PROJECT_NAME ?? "Raypx",
  title: process.env.NEXT_PUBLIC_SITE_TITLE ?? "Raypx - AI-Powered Platform",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "A modern AI-powered platform built with Next.js",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000",
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "en",
  theme:
    (process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE as any) ??
    (process.env.NEXT_PUBLIC_DEFAULT_THEME as any) ??
    "system",
  themeColor: process.env.NEXT_PUBLIC_THEME_COLOR ?? "#3b82f6",
  themeColorDark: process.env.NEXT_PUBLIC_THEME_COLOR_DARK ?? "#1e40af",
  version: process.env.NEXT_PUBLIC_APP_VERSION,
  production,
});

export default appConfig;
