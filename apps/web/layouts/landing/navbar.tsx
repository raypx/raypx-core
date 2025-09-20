"use client";

import { useAuth } from "@raypx/auth/core";
import { OrganizationSwitcher } from "@raypx/auth/organization";
import { Button, buttonVariants } from "@raypx/ui/components/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@raypx/ui/components/navigation-menu";
import { Skeleton } from "@raypx/ui/components/skeleton";
// import { ModeSwitcher } from "@/components/layout/mode-switcher"
import { ThemeSwitcher } from "@raypx/ui/components/theme-switcher";
import { cn } from "@raypx/ui/lib/utils";
import { ArrowUpRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
// import LocaleSwitcher from './locale-switcher';
import { LangSwitcher } from "@/components/lang-switcher";
import Container from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
// import { UserButton } from "@/components/layout/user-button"
import { Link as LocaleLink, usePathname as useLocalePathname } from "@/components/link";
import { getNavbarLinks } from "@/config/navbar.config";
import { Routes } from "@/config/routes.config";
import { useScroll } from "@/hooks/use-scroll";
import { LoginWrapper } from "@/layouts/landing/login-wrapper";
import appConfig from "../../config/app.config";
import { NavbarMobile } from "./navbar-mobile";

interface NavBarProps {
  scroll?: boolean;
}

const customNavigationMenuTriggerStyle = cn(
  navigationMenuTriggerStyle(),
  "relative bg-transparent text-muted-foreground cursor-pointer",
  "hover:bg-accent hover:text-accent-foreground",
  "focus:bg-accent focus:text-accent-foreground",
  "data-active:font-semibold data-active:bg-transparent data-active:text-accent-foreground",
  "data-[state=open]:bg-transparent data-[state=open]:text-accent-foreground",
);

export function Navbar({ scroll }: NavBarProps) {
  const t = useTranslations();
  const scrolled = useScroll(50);

  const {
    hooks: { useSession },
  } = useAuth();
  const { data: session, isPending } = useSession();
  const menuLinks = getNavbarLinks();
  const localePathname = useLocalePathname();
  const [mounted, setMounted] = useState(false);
  // const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;
  // console.log(`Navbar, user:`, user);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      className={cn(
        "sticky inset-x-0 top-0 z-40 py-4 transition-all duration-300",
        scroll
          ? scrolled
            ? "bg-muted/50 backdrop-blur-md border-b supports-backdrop-filter:bg-muted/50"
            : "bg-transparent"
          : "border-b bg-muted/50",
      )}
    >
      <Container className="px-4">
        {/* desktop navbar */}
        <nav className="hidden lg:flex">
          {/* logo and name */}
          <div className="flex items-center">
            <LocaleLink href="/" className="flex items-center space-x-2">
              <Logo />
              <span className="text-xl font-semibold">{appConfig.name}</span>
            </LocaleLink>
          </div>

          {/* menu links */}
          <div className="flex-1 flex items-center justify-center space-x-2">
            <NavigationMenu className="relative">
              <NavigationMenuList className="flex items-center">
                {menuLinks?.map((item, index) =>
                  item.items ? (
                    <NavigationMenuItem key={index} className="relative">
                      <NavigationMenuTrigger
                        data-active={
                          item.items.some((subItem) =>
                            subItem.href ? localePathname.startsWith(subItem.href) : false,
                          )
                            ? "true"
                            : undefined
                        }
                        className={customNavigationMenuTriggerStyle}
                      >
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-4 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.items?.map((subItem, subIndex) => {
                            const isSubItemActive =
                              subItem.href && localePathname.startsWith(subItem.href);
                            return (
                              <li key={subIndex}>
                                <NavigationMenuLink asChild>
                                  <LocaleLink
                                    href={subItem.href || "#"}
                                    target={subItem.external ? "_blank" : undefined}
                                    rel={subItem.external ? "noopener noreferrer" : undefined}
                                    className={cn(
                                      "group flex select-none flex-row items-center gap-4 rounded-md",
                                      "p-2 leading-none no-underline outline-hidden transition-colors",
                                      "hover:bg-accent hover:text-accent-foreground",
                                      "focus:bg-accent focus:text-accent-foreground",
                                      isSubItemActive && "bg-accent text-accent-foreground",
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "flex size-8 shrink-0 items-center justify-center transition-colors",
                                        "bg-transparent text-muted-foreground",
                                        "group-hover:bg-transparent group-hover:text-accent-foreground",
                                        "group-focus:bg-transparent group-focus:text-accent-foreground",
                                        isSubItemActive && "bg-transparent text-accent-foreground",
                                      )}
                                    >
                                      {subItem.icon ? subItem.icon : null}
                                    </div>
                                    <div className="flex-1">
                                      <div
                                        className={cn(
                                          "text-sm font-medium text-muted-foreground",
                                          "group-hover:bg-transparent group-hover:text-accent-foreground",
                                          "group-focus:bg-transparent group-focus:text-accent-foreground",
                                          isSubItemActive &&
                                            "bg-transparent text-accent-foreground",
                                        )}
                                      >
                                        {subItem.title}
                                      </div>
                                      {subItem.description && (
                                        <div
                                          className={cn(
                                            "text-sm text-muted-foreground",
                                            "group-hover:bg-transparent group-hover:text-accent-foreground/80",
                                            "group-focus:bg-transparent group-focus:text-accent-foreground/80",
                                            isSubItemActive &&
                                              "bg-transparent text-accent-foreground/80",
                                          )}
                                        >
                                          {subItem.description}
                                        </div>
                                      )}
                                    </div>
                                    {subItem.external && (
                                      <ArrowUpRightIcon
                                        className={cn(
                                          "size-4 shrink-0 text-muted-foreground",
                                          "group-hover:bg-transparent group-hover:text-accent-foreground",
                                          "group-focus:bg-transparent group-focus:text-accent-foreground",
                                          isSubItemActive &&
                                            "bg-transparent text-accent-foreground",
                                        )}
                                      />
                                    )}
                                  </LocaleLink>
                                </NavigationMenuLink>
                              </li>
                            );
                          })}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink
                        asChild
                        active={
                          item.href
                            ? item.href === "/"
                              ? localePathname === "/"
                              : localePathname.startsWith(item.href)
                            : false
                        }
                        className={customNavigationMenuTriggerStyle}
                      >
                        <LocaleLink
                          href={item.href || "#"}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                        >
                          {item.title}
                        </LocaleLink>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ),
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* navbar right show sign in or user */}
          <div className="flex items-center gap-x-4">
            {!mounted || isPending ? (
              <Skeleton className="size-8 border rounded-full" />
            ) : currentUser ? (
              <>
                <OrganizationSwitcher />
                {/* <CreditsBalanceButton /> */}
                {/* <UserButton user={currentUser} /> */}
              </>
            ) : (
              <div className="flex items-center gap-x-4">
                <LoginWrapper mode="modal" asChild>
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    {t("common.login")}
                  </Button>
                </LoginWrapper>

                <LocaleLink
                  href={Routes.Register}
                  className={cn(
                    buttonVariants({
                      variant: "default",
                      size: "sm",
                    }),
                  )}
                >
                  {t("common.signUp")}
                </LocaleLink>
              </div>
            )}

            <ThemeSwitcher />
            <LangSwitcher />
          </div>
        </nav>

        {/* mobile navbar */}
        <NavbarMobile className="lg:hidden" />
      </Container>
    </section>
  );
}
