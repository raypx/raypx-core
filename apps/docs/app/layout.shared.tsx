import { HomeIcon } from "@raypx/ui/components/icons"
import { ThemeSwitcher } from "@raypx/ui/components/theme-switcher"
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import { getPathname } from "@/components/link"
import { Logo } from "@/components/logo"
import appConfig from "@/config/app.config"
import { docsI18nConfig } from "@/lib/docs/i18n"

export function baseOptions(locale: string): BaseLayoutProps {
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
        text: "Homepage",
        url: getPathname({ href: "/", locale }),
        icon: <HomeIcon />,
        active: "none",
        external: false,
      },
      {
        url: getPathname({ href: "/docs", locale }),
        text: "Docs",
      },
      {
        url: getPathname({ href: "/blog", locale }),
        text: "Blog",
      },
      {
        url: getPathname({ href: "/changelog", locale }),
        text: "Changelog",
      },
      {
        url: "https://github.com/raypx/raypx/discussions",
        text: "Community",
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
  }
}
