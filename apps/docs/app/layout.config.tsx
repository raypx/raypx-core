import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import appConfig from "@/config/app.config"

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <svg
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Logo"
        >
          <circle cx={12} cy={12} r={12} fill="currentColor" />
        </svg>
        {appConfig.name}
      </>
    ),
  },
  links: [
    {
      url: "/docs",
      text: "Docs",
    },
    {
      url: "https://raypx.featurebase.app/roadmap",
      text: "Roadmap",
    },
  ],
  themeSwitch: {
    enabled: true,
    mode: "light-dark-system",
  },
  githubUrl: appConfig.githubUrl,
}
