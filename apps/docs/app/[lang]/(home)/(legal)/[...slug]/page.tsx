import { dayjs } from "@raypx/shared/utils"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import appConfig from "@/config/app.config"
import { pagesSource } from "@/lib/source"
import { getMDXComponents } from "@/mdx-components"

interface PageProps {
  params: Promise<{
    lang: string
    slug: string[]
  }>
}

export async function generateStaticParams() {
  return pagesSource.generateParams()
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const page = pagesSource.getPage(slug, lang)

  if (!page) {
    notFound()
  }

  const title = `${page.data.title} | ${appConfig.name}`
  const description =
    page.data.description || `${page.data.title} - ${appConfig.name}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: page.data.date
        ? dayjs(page.data.date).locale(lang).format("LL")
        : undefined,
    },
  }
}

export default async function Page({ params }: PageProps) {
  const { slug, lang } = await params
  const page = pagesSource.getPage(slug, lang)

  if (!page) {
    notFound()
  }

  return (
    <div className="container max-w-4xl py-12">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">{page.data.title}</h1>

        {page.data.description && (
          <p className="text-lg text-muted-foreground">
            {page.data.description}
          </p>
        )}

        {page.data.date && (
          <div className="mt-4 text-sm text-muted-foreground">
            {dayjs(page.data.date).locale(lang).format("LL")}
          </div>
        )}
      </header>

      {/* Page Content */}
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <page.data.body components={getMDXComponents()} />
      </article>
    </div>
  )
}
