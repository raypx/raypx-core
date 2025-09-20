"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { FC, ReactNode } from "react";
import { useEffect, useState } from "react";
import { envs } from "./envs";
import type { PostHogInstance, PostHogProvider } from "./types";

let posthogInstance: PostHogInstance | null = null;
let PostHogProviderComponent: PostHogProvider | null = null;

async function loadPostHog(): Promise<{
  posthog: PostHogInstance | null;
  PostHogProvider: PostHogProvider | null;
}> {
  if (posthogInstance)
    return {
      posthog: posthogInstance,
      PostHogProvider: PostHogProviderComponent,
    };

  try {
    const [posthogModule, reactModule] = await Promise.all([
      import("posthog-js").catch(() => null),
      import("posthog-js/react").catch(() => null),
    ]);

    if (!posthogModule || !reactModule) {
      return { posthog: null, PostHogProvider: null };
    }

    posthogInstance = posthogModule.default as PostHogInstance;
    PostHogProviderComponent = reactModule.PostHogProvider as PostHogProvider;

    return {
      posthog: posthogInstance,
      PostHogProvider: PostHogProviderComponent,
    };
  } catch (_error) {
    // Silent fail - PostHog is optional
    return { posthog: null, PostHogProvider: null };
  }
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthogInstance?.__loaded) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }
      posthogInstance.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export const PostHogAnalyticsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [Provider, setProvider] = useState<PostHogProvider | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      envs.NEXT_PUBLIC_POSTHOG_KEY &&
      envs.NEXT_PUBLIC_POSTHOG_HOST &&
      !envs.NEXT_PUBLIC_ANALYTICS_DISABLED &&
      (process.env.NODE_ENV === "production" || envs.NEXT_PUBLIC_ANALYTICS_DEBUG)
    ) {
      loadPostHog().then(({ posthog, PostHogProvider: PHProvider }) => {
        if (posthog && PHProvider && envs.NEXT_PUBLIC_POSTHOG_KEY) {
          posthog.init(envs.NEXT_PUBLIC_POSTHOG_KEY, {
            api_host: envs.NEXT_PUBLIC_POSTHOG_HOST,
            ui_host: envs.NEXT_PUBLIC_POSTHOG_HOST,
            person_profiles: "identified_only",
            capture_pageview: false,
            capture_pageleave: true,
            capture_heatmaps: true,
            capture_performance: true,
            disable_session_recording: false,
            session_recording: {
              maskAllInputs: true,
              maskInputOptions: {
                password: true,
                email: false,
              },
            },
            autocapture: true,
            debug: envs.NEXT_PUBLIC_ANALYTICS_DEBUG || false,
            loaded: (posthog: PostHogInstance) => {
              if (envs.NEXT_PUBLIC_ANALYTICS_DEBUG) {
                console.log("PostHog loaded successfully", posthog);
              }
            },
          });
          setProvider(() => PHProvider);
        }
        setIsLoaded(true);
      });
    } else {
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return <>{children}</>;
  }

  if (!Provider || !posthogInstance) {
    return <>{children}</>;
  }

  return (
    <Provider client={posthogInstance}>
      {children}
      <PostHogPageView />
    </Provider>
  );
};
