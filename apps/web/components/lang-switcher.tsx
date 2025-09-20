"use client";

import { setUserLocale } from "@raypx/i18n";
import { Button } from "@raypx/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@raypx/ui/components/dropdown-menu";
import { cn } from "@raypx/ui/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

const locales = [
  { code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", nativeName: "中文" },
] as const;

export const LangSwitcher = () => {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = locales.find((l) => l.code === locale);

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) return;

    setIsOpen(false);
    setUserLocale(newLocale);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-3 gap-2">
          {/* <Languages className="h-4 w-4" /> */}
          <span className="hidden sm:inline-block text-sm font-medium">
            {currentLocale?.nativeName}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              locale === loc.code && "bg-accent",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{loc.flag}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{loc.nativeName}</span>
                <span className="text-xs text-muted-foreground">{loc.name}</span>
              </div>
            </div>
            {locale === loc.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
