"use client";

import { cn } from "@raypx/ui/lib/utils";
import { useTranslations } from "next-intl";
import type React from "react";
import Container from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { ModeSwitcherHorizontal } from "@/components/layout/mode-switcher-horizontal";
import { Link as LocaleLink } from "@/components/link";
import { getFooterLinks } from "@/config/footer.config";
import { getSocialLinks } from "@/config/social.config";

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("layout");
  const footerLinks = getFooterLinks();
  const socialLinks = getSocialLinks();

  return (
    <footer className={cn("border-t", className)}>
      <Container className="px-4">
        <div className="grid grid-cols-2 gap-8 py-16 md:grid-cols-6">
          <div className="flex flex-col items-start col-span-full md:col-span-2">
            <div className="space-y-4">
              {/* logo and name */}
              <div className="items-center space-x-2 flex">
                <Logo />
                <span className="text-xl font-semibold">Raypx</span>
              </div>

              {/* tagline */}
              <p className="text-muted-foreground text-base py-2 md:pr-12">{t("footer.tagline")}</p>

              {/* social links */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex items-center gap-2">
                  {socialLinks?.map((link) => (
                    <a
                      key={link.title}
                      href={link.href || "#"}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.title}
                      className="border border-border inline-flex h-8 w-8 items-center
                          justify-center rounded-full hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="sr-only">{link.title}</span>
                      {link.icon ? link.icon : null}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {footerLinks?.map((section) => (
            <div key={section.title} className="col-span-1 md:col-span-1 items-start">
              <span className="text-sm font-semibold uppercase">{section.title}</span>
              <ul className="mt-4 list-inside space-y-3">
                {section.items?.map(
                  (item) =>
                    item.href && (
                      <li key={item.title}>
                        <LocaleLink
                          href={item.href || "#"}
                          target={item.external ? "_blank" : undefined}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {item.title}
                        </LocaleLink>
                      </li>
                    ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t py-8">
        <Container className="px-4 flex items-center justify-between gap-x-4">
          <span className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Raypx All Rights Reserved.
          </span>

          <div className="flex items-center gap-x-4">
            <ModeSwitcherHorizontal />
          </div>
        </Container>
      </div>
    </footer>
  );
}
