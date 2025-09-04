import { dayjs } from "@raypx/shared/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@raypx/ui/components/card"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import appConfig from "@/config/app.config"
import { blogSource } from "@/lib/source"

interface BlogPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { lang } = await params

  const title = lang === "zh" ? "博客" : "Blog"
  const description =
    lang === "zh"
      ? `${appConfig.name} 的最新文章和技术分享`
      : `Latest articles and tech insights from ${appConfig.name}`

  return {
    title,
    description,
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { lang } = await params

  // Get all blog posts
  const posts = blogSource.getPages(lang)

  if (!posts.length) {
    notFound()
  }

  const title = lang === "zh" ? "博客" : "Blog"
  const description =
    lang === "zh"
      ? "最新的技术文章和产品动态"
      : "Latest technical articles and product updates"

  return (
    <div className="container max-w-6xl py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">{title}</h1>
        <p className="text-xl text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const formattedDate = dayjs(post.data.date).locale(lang).format("LL")
          return (
            <Link
              key={post.url}
              href={post.url}
              className="block transition-transform hover:scale-105"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {post.data.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formattedDate}
                  </p>
                </CardHeader>
                {post.data.description && (
                  <CardContent>
                    <p className="line-clamp-3 text-muted-foreground">
                      {post.data.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
