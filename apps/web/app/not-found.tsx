"use client";

import { Button } from "@raypx/ui/components/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("common.pages.404");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("title")}</h2>
        <p className="text-gray-600 mb-8">{t("description")}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button>{t("backToHome")}</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">{t("goToDashboard")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
