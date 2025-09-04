import { dayjs } from "@raypx/shared/utils"
import { Badge } from "@raypx/ui/components/badge"
import { Card, CardContent, CardHeader } from "@raypx/ui/components/card"
import { Calendar, Tag } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import appConfig from "@/config/app.config"
import { changelogSource } from "@/lib/source"
import { getMDXComponents } from "@/mdx-components"

interface ChangelogPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({
  params,
}: ChangelogPageProps): Promise<Metadata> {
  const { lang } = await params

  const title = lang === "zh" ? "更新日志" : "Changelog"
  const description =
    lang === "zh"
      ? `${appConfig.name} 的产品更新和版本历史`
      : `Product updates and version history for ${appConfig.name}`

  return {
    title,
    description,
    alternates: {
      canonical: `${appConfig.url}/${lang}/changelog`,
      languages: {
        en: `${appConfig.url}/en/changelog`,
        zh: `${appConfig.url}/zh/changelog`,
      },
    },
  }
}

export default async function ChangelogPage({ params }: ChangelogPageProps) {
  const { lang } = await params

  // Get all changelog entries
  const entries = changelogSource
    .getPages(lang)
    .filter((entry) => entry.data.published !== false)
    .sort((a, b) => {
      const dateA = new Date(a.data.date).getTime()
      const dateB = new Date(b.data.date).getTime()
      return dateB - dateA // Sort by date descending
    })

  if (!entries.length) {
    notFound()
  }

  const title = lang === "zh" ? "更新日志" : "Changelog"
  const description =
    lang === "zh"
      ? "产品的最新更新和改进"
      : "Latest product updates and improvements"

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">{title}</h1>
        <p className="text-xl text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-12">
        {entries.map((entry, index) => {
          const formattedDate = dayjs(entry.data.date).locale(lang).format("LL")

          return (
            <div key={entry.url} className="relative">
              {/* Timeline connector */}
              {index !== entries.length - 1 && (
                <div className="absolute left-6 top-16 h-full w-0.5 bg-border" />
              )}

              <div className="flex gap-6">
                {/* Timeline dot */}
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border-2 border-primary">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="secondary"
                              className="font-mono text-base px-3 py-1"
                            >
                              {entry.data.version}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <time dateTime={formattedDate}>
                                {formattedDate}
                              </time>
                            </div>
                          </div>
                          <h2 className="text-2xl font-bold">
                            {entry.data.title}
                          </h2>
                          {entry.data.description && (
                            <p className="text-muted-foreground">
                              {entry.data.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* 完整的 changelog 内容 */}
                      <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-foreground prose-li:text-muted-foreground">
                        <entry.data.body components={getMDXComponents()} />
                      </article>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
