import type { I18nConfig } from "fumadocs-core/i18n";
import { defaultLocale, locales } from "@/config/i18n.config";

/**
 * Internationalization configuration for FumaDocs
 *
 * https://fumadocs.dev/docs/ui/internationalization
 */
export const docsI18nConfig: I18nConfig = {
  defaultLanguage: defaultLocale,
  languages: locales as unknown as string[],
  hideLocale: "default-locale",
};
