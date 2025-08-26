import type { NextSeoProps } from "next-seo"
import {
  ArticleJsonLd,
  BreadcrumbJsonLd,
  NextSeo,
  OrganizationJsonLd,
  SiteLinksSearchBoxJsonLd,
  WebPageJsonLd,
} from "next-seo"
import type { ReactNode } from "react"
import type { SEOConfig } from "./metadata"
import { createSEOProps } from "./metadata"
import type { StructuredDataType } from "./structured-data"

export interface ArticleProps {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  authorName: string
  publisherName?: string
  publisherLogo?: string
  images?: string[]
  children?: ReactNode
}

export function Article({
  title,
  description,
  url,
  datePublished,
  dateModified,
  authorName,
  publisherName = "Raypx",
  publisherLogo,
  images = [],
  children,
}: ArticleProps) {
  return (
    <>
      <ArticleJsonLd
        url={url}
        title={title}
        images={images}
        datePublished={datePublished}
        dateModified={dateModified || datePublished}
        authorName={[authorName]}
        publisherName={publisherName}
        publisherLogo={publisherLogo}
        description={description}
      />
      {children}
    </>
  )
}

export interface BreadcrumbProps {
  itemListElements: Array<{
    position: number
    name: string
    item: string
  }>
  children?: ReactNode
}

export function Breadcrumb({ itemListElements, children }: BreadcrumbProps) {
  return (
    <>
      <BreadcrumbJsonLd itemListElements={itemListElements} />
      {children}
    </>
  )
}

export interface OrganizationProps {
  type?: string
  id?: string
  name: string
  url: string
  logo?: string
  sameAs?: string[]
  contactPoints?: Array<{
    telephone: string
    contactType: string
    areaServed?: string[]
    availableLanguage?: string[]
  }>
  children?: ReactNode
}

export function Organization({
  type = "Organization",
  id,
  name,
  url,
  logo,
  sameAs = [],
  contactPoints = [],
  children,
}: OrganizationProps) {
  return (
    <>
      <OrganizationJsonLd
        type={type}
        id={id}
        name={name}
        url={url}
        logo={logo}
        sameAs={sameAs}
        contactPoint={contactPoints}
      />
      {children}
    </>
  )
}

export interface WebPageProps {
  url: string
  description: string
  lastReviewed?: string
  reviewedBy?: {
    type: string
    name: string
  }
  children?: ReactNode
}

export function WebPage({
  url,
  description,
  lastReviewed,
  reviewedBy,
  children,
}: WebPageProps) {
  return (
    <>
      <WebPageJsonLd
        description={description}
        id={url}
        lastReviewed={lastReviewed}
        reviewedBy={reviewedBy}
      />
      {children}
    </>
  )
}

export interface SiteSearchProps {
  url: string
  children?: ReactNode
}

export function SiteSearch({ url, children }: SiteSearchProps) {
  return (
    <>
      <SiteLinksSearchBoxJsonLd
        url={url}
        potentialActions={[
          {
            target: `${url}/search?q={search_term_string}`,
            queryInput: "required name=search_term_string",
          },
        ]}
      />
      {children}
    </>
  )
}

// Core SEO components from components.tsx
export interface SEOProviderProps extends SEOConfig {
  children?: ReactNode
  structuredData?: StructuredDataType[]
}

export function SEOProvider({
  children,
  structuredData = [],
  ...seoConfig
}: SEOProviderProps) {
  const seoProps = createSEOProps(seoConfig)

  return (
    <>
      <NextSeo {...seoProps} />
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      {children}
    </>
  )
}

export interface PageSEOProps extends NextSeoProps {
  structuredData?: StructuredDataType[]
}

export function PageSEO({ structuredData = [], ...seoProps }: PageSEOProps) {
  return (
    <>
      <NextSeo {...seoProps} />
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  )
}

export interface ArticleSEOProps extends SEOConfig {
  structuredData?: StructuredDataType[]
  datePublished: string
  dateModified?: string
  author?: string
  url: string
}

export function ArticleSEO({
  structuredData = [],
  datePublished,
  dateModified,
  author,
  url,
  ...seoConfig
}: ArticleSEOProps) {
  const seoProps = createSEOProps({
    ...seoConfig,
    openGraph: {
      type: "article",
      ...seoConfig.openGraph,
    },
  })

  return (
    <>
      <NextSeo
        {...seoProps}
        openGraph={{
          ...seoProps.openGraph,
          article: {
            publishedTime: datePublished,
            modifiedTime: dateModified || datePublished,
            ...(author && { authors: [author] }),
          },
        }}
      />
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  )
}

export interface JsonLdProps {
  data: StructuredDataType
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Re-export all next-seo JSON-LD components
export {
  ArticleJsonLd,
  BrandJsonLd,
  BreadcrumbJsonLd,
  CampgroundJsonLd,
  CarouselJsonLd,
  CollectionPageJsonLd,
  CorporateContactJsonLd,
  CourseJsonLd,
  DatasetJsonLd,
  DefaultSeo,
  EventJsonLd,
  FAQPageJsonLd,
  HowToJsonLd,
  ImageJsonLd,
  JobPostingJsonLd,
  LocalBusinessJsonLd,
  LogoJsonLd,
  NewsArticleJsonLd,
  OrganizationJsonLd,
  ParkJsonLd,
  ProductJsonLd,
  ProfilePageJsonLd,
  QAPageJsonLd,
  RecipeJsonLd,
  SiteLinksSearchBoxJsonLd,
  SocialProfileJsonLd,
  SoftwareAppJsonLd,
  VideoGameJsonLd,
  VideoJsonLd,
  WebPageJsonLd,
} from "next-seo"
