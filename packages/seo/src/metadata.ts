import { merge } from "@raypx/shared";
import type { Metadata } from "next";
import type { NextSeoProps } from "next-seo";

export interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  keywords?: string[];
  additionalMetaTags?: NextSeoProps["additionalMetaTags"];
  additionalLinkTags?: NextSeoProps["additionalLinkTags"];
  openGraph?: {
    type?: string;
    locale?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
  twitter?: {
    handle?: string;
    site?: string;
    cardType?: "summary" | "summary_large_image" | "app" | "player";
  };
}

type MetadataGenerator = Omit<Metadata, "description" | "title"> & SEOConfig;

const applicationName = "Raypx";

const author: Metadata["authors"] = {
  name: "Raypx",
  url: "https://raypx.com/",
};

const publisher = "Raypx";
const twitterHandle = "@raypx_com";
const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const baseUrl = productionUrl ? `${protocol}://${productionUrl}` : undefined;

export const defaultSEOConfig: NextSeoProps = {
  titleTemplate: `%s | ${applicationName}`,
  defaultTitle: applicationName,
  description: "Raypx - Your application description",
  canonical: baseUrl,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: applicationName,
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: applicationName,
      },
    ],
  },
  twitter: {
    handle: twitterHandle,
    site: twitterHandle,
    cardType: "summary_large_image",
  },
  additionalMetaTags: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      name: "application-name",
      content: applicationName,
    },
    {
      name: "apple-mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "default",
    },
    {
      name: "format-detection",
      content: "telephone=no",
    },
    {
      name: "theme-color",
      content: "#000000",
    },
  ],
};

export const createSEOProps = (config: SEOConfig = {}): NextSeoProps => {
  const {
    title,
    description,
    image,
    canonical,
    noindex,
    nofollow,
    keywords,
    additionalMetaTags = [],
    additionalLinkTags = [],
    openGraph,
    twitter,
  } = config;

  const seoProps: NextSeoProps = {
    ...defaultSEOConfig,
    ...(title && { title }),
    ...(description && { description }),
    ...(canonical && { canonical }),
    ...(noindex && { noindex }),
    ...(nofollow && { nofollow }),
    additionalMetaTags: [
      ...(defaultSEOConfig.additionalMetaTags || []),
      ...additionalMetaTags,
      ...(keywords
        ? [
            {
              name: "keywords",
              content: keywords.join(", "),
            },
          ]
        : []),
    ],
    additionalLinkTags: [...additionalLinkTags],
  };

  if (openGraph || image) {
    seoProps.openGraph = {
      ...defaultSEOConfig.openGraph,
      ...openGraph,
      ...(image && {
        images: [
          {
            url: image,
            width: openGraph?.images?.[0]?.width || 1200,
            height: openGraph?.images?.[0]?.height || 630,
            alt: openGraph?.images?.[0]?.alt || title || applicationName,
          },
        ],
      }),
    };
  }

  if (twitter) {
    seoProps.twitter = {
      ...defaultSEOConfig.twitter,
      ...twitter,
    };
  }

  return seoProps;
};

export const createMetadata = ({
  title,
  description,
  image,
  canonical,
  keywords,
  openGraph,
  ...properties
}: MetadataGenerator = {}): Metadata => {
  const parsedTitle = title ? `${title} | ${applicationName}` : applicationName;

  const defaultMetadata: Metadata = {
    title: parsedTitle,
    description,
    applicationName,
    metadataBase: productionUrl ? new URL(`${protocol}://${productionUrl}`) : undefined,
    authors: [author],
    creator: author.name,
    publisher,
    keywords: keywords?.join(", "),
    alternates: {
      canonical,
    },
    formatDetection: {
      telephone: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: parsedTitle,
    },
    openGraph: {
      title: parsedTitle,
      description,
      type: "website",
      siteName: applicationName,
      locale: "en_US",
      url: canonical || baseUrl,
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: twitterHandle,
      site: twitterHandle,
    },
  };

  const metadata: Metadata = merge(defaultMetadata, properties);

  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: title || applicationName,
      },
    ];
  }

  return metadata;
};
