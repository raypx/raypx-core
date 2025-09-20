import type {
  Article,
  BreadcrumbList,
  Organization,
  Person,
  WebSite,
  WithContext,
} from "schema-dts";

export type StructuredDataType =
  | WithContext<WebSite>
  | WithContext<Organization>
  | WithContext<Person>
  | WithContext<Article>
  | WithContext<BreadcrumbList>;

const applicationName = "Raypx";
const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `${process.env.NODE_ENV === "production" ? "https" : "http"}://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;

export const createWebSiteStructuredData = (): WithContext<WebSite> => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: applicationName,
  url: baseUrl,
  description: "Raypx - Your application description",
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/search?q={search_term_string}`,
  },
});

export const createOrganizationStructuredData = (): WithContext<Organization> => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: applicationName,
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  sameAs: ["https://twitter.com/raypx_com"],
});

export const createArticleStructuredData = ({
  title,
  description,
  image,
  author = applicationName,
  datePublished,
  dateModified,
  url,
}: {
  title: string;
  description: string;
  image?: string;
  author?: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}): WithContext<Article> => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  image: image || `${baseUrl}/og-image.png`,
  author: {
    "@type": "Person",
    name: author,
  },
  publisher: {
    "@type": "Organization",
    name: applicationName,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.png`,
    },
  },
  datePublished,
  dateModified: dateModified || datePublished,
  url,
});

export const createBreadcrumbStructuredData = (
  breadcrumbs: Array<{ name: string; url: string }>,
): WithContext<BreadcrumbList> => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((breadcrumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: breadcrumb.name,
    item: breadcrumb.url,
  })),
});

export const createPersonStructuredData = ({
  name,
  jobTitle,
  url,
  image,
  sameAs = [],
}: {
  name: string;
  jobTitle?: string;
  url?: string;
  image?: string;
  sameAs?: string[];
}): WithContext<Person> => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name,
  ...(jobTitle && { jobTitle }),
  ...(url && { url }),
  ...(image && { image }),
  ...(sameAs.length > 0 && { sameAs }),
});
