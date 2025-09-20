import { ThemeSwitcher } from "@raypx/ui/components/theme-switcher";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { getPathname } from "@/components/link";
import { Logo } from "@/components/logo";
import appConfig from "@/config/app.config";
import { docsI18nConfig } from "@/lib/docs/i18n";

export function baseOptions(locale: string, t: any): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Logo size={24} priority />
          {appConfig.name}
        </>
      ),
      // Enable enhanced navigation features
      transparentMode: "top",
    },
    links: [
      {
        url: getPathname({ href: "/docs", locale }),
        text: t("docs.title"),
      },
      {
        url: getPathname({ href: "/blog", locale }),
        text: t("blog.title"),
      },
      {
        url: getPathname({ href: "/changelog", locale }),
        text: t("changelog.title"),
      },
      {
        url: "https://github.com/raypx/raypxjs/discussions",
        text: t("community.title"),
        external: true,
      },
    ],

    themeSwitch: {
      enabled: true,
      mode: "light-dark-system",
      component: <ThemeSwitcher />,
    },

    githubUrl: appConfig.githubUrl,

    i18n: {
      ...docsI18nConfig,
      defaultLanguage: locale,
    },
  };
}
