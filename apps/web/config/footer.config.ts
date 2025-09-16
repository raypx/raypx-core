"use client"

import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { Routes } from "./routes.config"

export type MenuItem = {
  title: string // The text to display
  description?: string // The description of the item
  icon?: ReactNode // The icon to display
  href?: string // The url to link to
  external?: boolean // Whether the link is external
  authorizeOnly?: string[] // The roles that are authorized to see the item
}

export type NestedMenuItem = MenuItem & {
  items?: MenuItem[] // The items to display in the nested menu
}

export function getFooterLinks(): NestedMenuItem[] {
  const t = useTranslations("layout.footer")

  return [
    {
      title: t("product.title"),
      items: [
        {
          title: t("product.items.features"),
          href: Routes.Features,
          external: false,
        },
        {
          title: t("product.items.pricing"),
          href: Routes.Pricing,
          external: false,
        },
        {
          title: t("product.items.faq"),
          href: Routes.FAQ,
          external: false,
        },
      ],
    },
    {
      title: t("resources.title"),
      items: [
        {
          title: t("resources.items.blog"),
          href: Routes.Blog,
          external: false,
        },

        {
          title: t("resources.items.docs"),
          href: Routes.Docs,
          external: false,
        },
        {
          title: t("resources.items.changelog"),
          href: Routes.Changelog,
          external: false,
        },
        {
          title: t("resources.items.roadmap"),
          href: Routes.Roadmap,
          external: true,
        },
      ],
    },
    {
      title: t("company.title"),
      items: [
        {
          title: t("company.items.about"),
          href: Routes.About,
          external: false,
        },
        {
          title: t("company.items.contact"),
          href: Routes.Contact,
          external: false,
        },
        {
          title: t("company.items.waitlist"),
          href: Routes.Waitlist,
          external: false,
        },
      ],
    },
    {
      title: t("legal.title"),
      items: [
        {
          title: t("legal.items.cookiePolicy"),
          href: Routes.CookiePolicy,
          external: false,
        },
        {
          title: t("legal.items.privacyPolicy"),
          href: Routes.PrivacyPolicy,
          external: false,
        },
        {
          title: t("legal.items.termsOfService"),
          href: Routes.TermsOfService,
          external: false,
        },
      ],
    },
  ]
}
