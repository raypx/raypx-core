import type { MetadataRoute } from "next"
import appConfig from "@/config/app.config"
import { LOCALES } from "@/lib/i18n/routing"
import { blogSource, changelogSource, pagesSource, source } from "@/lib/source"

export const revalidate = false

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string): string => new URL(path, appConfig.url).toString()
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Add main pages for each locale
  LOCALES.forEach((locale) => {
    sitemapEntries.push(
      {
        url: url(`/${locale}`),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: url(`/${locale}/docs`),
        changeFrequency: "weekly",
        priority: 0.9,
      },
    )
  })

  // Add documentation pages
  LOCALES.forEach((locale) => {
    source.getPages().forEach((page) => {
      const { lastModified } = page.data
      sitemapEntries.push({
        url: url(`/${locale}${page.url}`),
        lastModified: lastModified ? new Date(lastModified) : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    })
  })

  // Add blog pages
  const blogPosts = blogSource.getPages()
  if (blogPosts.length > 0) {
    LOCALES.forEach((locale) => {
      // Blog index page
      sitemapEntries.push({
        url: url(`/${locale}/blog`),
        changeFrequency: "weekly",
        priority: 0.7,
      })

      // Individual blog posts
      blogPosts.forEach((post) => {
        if (post.data.published !== false) {
          sitemapEntries.push({
            url: url(`/${locale}${post.url}`),
            lastModified: new Date(post.data.date),
            changeFrequency: "monthly",
            priority: 0.6,
          })
        }
      })
    })
  }

  // Add changelog pages
  const changelogEntries = changelogSource.getPages()
  if (changelogEntries.length > 0) {
    LOCALES.forEach((locale) => {
      // Changelog index page
      sitemapEntries.push({
        url: url(`/${locale}/changelog`),
        changeFrequency: "weekly",
        priority: 0.7,
      })

      // Individual changelog entries
      changelogEntries.forEach((entry) => {
        if (entry.data.published !== false) {
          sitemapEntries.push({
            url: url(`/${locale}${entry.url}`),
            lastModified: new Date(entry.data.date),
            changeFrequency: "monthly",
            priority: 0.5,
          })
        }
      })
    })
  }

  // Add static pages
  const staticPages = pagesSource.getPages()
  staticPages.forEach((page) => {
    if (page.data.published !== false) {
      LOCALES.forEach((locale) => {
        sitemapEntries.push({
          url: url(`/${locale}/pages${page.url}`),
          lastModified: page.data.date ? new Date(page.data.date) : undefined,
          changeFrequency: "monthly",
          priority: 0.4,
        })
      })
    }
  })

  return sitemapEntries
}
