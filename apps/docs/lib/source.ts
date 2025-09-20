import type { InferMetaType, InferPageType } from "fumadocs-core/source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { blog, changelog, docs, pages } from "@/.source";
import { docsI18nConfig } from "./docs/i18n";

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: "/docs",
  i18n: docsI18nConfig,
  source: docs.toFumadocsSource(),
});

export const pagesSource = loader({
  baseUrl: "/pages",
  source: createMDXSource(pages),
  i18n: docsI18nConfig,
});

export const blogSource = loader({
  baseUrl: "/blog",
  source: createMDXSource(blog),
  i18n: docsI18nConfig,
});

export const changelogSource = loader({
  baseUrl: "/changelog",
  source: createMDXSource(changelog),
  i18n: docsI18nConfig,
});

export type DocsType = InferPageType<typeof source>;
export type MetaType = InferMetaType<typeof source>;
export type PagesType = InferPageType<typeof pagesSource>;
export type BlogType = InferPageType<typeof blogSource>;
export type ChangelogType = InferPageType<typeof changelogSource>;
