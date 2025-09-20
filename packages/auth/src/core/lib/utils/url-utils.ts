/**
 * URL building utilities - unified handling of link concatenation logic for auth components
 */

/**
 * Path builder options
 */
interface PathBuilderOptions {
  /** Whether to preserve current query parameters */
  preserveSearch?: boolean;
  /** Additional query parameters */
  searchParams?: Record<string, string>;
  /** Path mode (for organization URLs) */
  pathMode?: "slug" | "id" | "default";
  /** Middleware path segment (e.g., organization slug) */
  middleware?: string;
}

/**
 * Core path builder - uses native URL API to handle path concatenation
 * @param basePath - Base path
 * @param segments - Array of path segments
 * @param options - Builder options
 */
const buildPath = (
  basePath: string,
  segments: (string | undefined)[],
  options: PathBuilderOptions = {},
): string => {
  const { preserveSearch = false, searchParams, pathMode, middleware } = options;

  // Filter valid path segments
  const validSegments = segments.filter(Boolean) as string[];

  if (!basePath && validSegments.length === 0) return "";

  // Build path array
  const pathParts = [basePath];

  // Add middleware path (e.g., organization slug) only when pathMode is 'slug'
  if (middleware && pathMode === "slug") {
    pathParts.push(middleware);
  }

  // Add remaining path segments
  pathParts.push(...validSegments);

  // Use join and replace to handle paths, avoiding duplicate slashes
  const cleanPath =
    pathParts
      .join("/")
      .replace(/\/+/g, "/") // Remove duplicate slashes
      .replace(/\/$/, "") || "/"; // Remove trailing slash but preserve root path

  // Handle query parameters
  if (preserveSearch || searchParams) {
    const url = new URL(cleanPath, "http://localhost"); // Use temporary domain to handle relative paths

    // Add current query parameters
    if (preserveSearch && typeof window !== "undefined") {
      const currentParams = new URLSearchParams(window.location.search);
      for (const [key, value] of currentParams.entries()) {
        url.searchParams.set(key, value);
      }
    }

    // Add additional query parameters
    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        url.searchParams.set(key, value);
      }
    }

    return `${url.pathname}${url.search}`;
  }

  return cleanPath;
};

/**
 * Build basic authentication URL
 * @param basePath - Base path
 * @param viewPath - View path
 * @param preserveSearch - Whether to preserve current query parameters
 */
export const buildAuthUrl = (
  basePath: string,
  viewPath: string,
  preserveSearch = false,
): string => {
  return buildPath(basePath, [viewPath], { preserveSearch });
};

/**
 * Build account settings URL
 * @param basePath - Account base path
 * @param viewPath - View path
 */
export const buildAccountUrl = (
  basePath: string | undefined,
  viewPath: string | undefined,
): string => {
  if (!basePath || !viewPath) return "";
  return buildPath(basePath, [viewPath]);
};

/**
 * Build organization URL
 * @param basePath - Organization base path
 * @param viewPath - View path
 * @param slug - Organization slug (optional)
 * @param pathMode - Path mode
 */
export const buildOrganizationUrl = (
  basePath: string | undefined,
  viewPath: string | undefined,
  slug?: string | undefined,
  pathMode?: "slug" | "id" | "default",
): string => {
  if (!basePath || !viewPath) return "";
  return buildPath(basePath, [viewPath], {
    middleware: slug,
    pathMode,
  });
};

/**
 * Generic URL builder - handles concatenation of multiple path segments
 * @param segments - Array of path segments
 * @param preserveSearch - Whether to preserve query parameters
 * @param searchParams - Additional query parameters
 */
export const buildUrl = (
  segments: (string | undefined)[],
  preserveSearch = false,
  searchParams?: Record<string, string>,
): string => {
  const validSegments = segments.filter(Boolean) as string[];

  if (validSegments.length === 0) return "";

  const [basePath, ...restSegments] = validSegments;

  return buildPath(basePath || "", restSegments, {
    preserveSearch,
    searchParams,
  });
};

/**
 * Build URL with custom query parameters
 * @param basePath - Base path
 * @param viewPath - View path
 * @param searchParams - Query parameters object
 * @param preserveSearch - Whether to preserve current query parameters
 */
export const buildUrlWithParams = (
  basePath: string,
  viewPath: string,
  searchParams: Record<string, string>,
  preserveSearch = false,
): string => {
  return buildPath(basePath, [viewPath], {
    searchParams,
    preserveSearch,
  });
};
