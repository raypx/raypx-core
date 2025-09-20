import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import appConfig from "@/config/app.config";
import { changelogSource } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import { ChangelogCard } from "./_components/card";

interface ChangelogPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: ChangelogPageProps): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({
    locale: lang,
  });
  const title = t("changelog.title");
  const description = t("changelog.description", { name: appConfig.name });

  return {
    title,
    description,
  };
}

export default async function ChangelogPage({ params }: ChangelogPageProps) {
  const { lang } = await params;
  const t = await getTranslations({
    locale: lang,
  });

  // Get all changelog entries
  const entries = changelogSource
    .getPages(lang)
    .filter((i) => i.data.published)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  if (!entries.length) {
    notFound();
  }

  const title = t("changelog.title");
  const description = t("changelog.description", { name: appConfig.name });

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">{title}</h1>
        <p className="text-xl text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-12">
        {entries.map((entry, index) => (
          <div className="relative">
            {index !== entries.length - 1 && (
              <div className="absolute left-6 top-16 h-full w-0.5 bg-border" />
            )}
            <ChangelogCard
              key={entry.url}
              date={entry.data.date}
              version={entry.data.version}
              title={entry.data.title}
              description={entry.data.description}
              body={<entry.data.body components={getMDXComponents()} />}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
