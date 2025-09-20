"use client";

import { Loader2 } from "@raypx/ui/components/icons";
import { useEffect, useRef } from "react";
import { useAuth } from "../../core/hooks/use-auth";
import { useOnSuccessTransition } from "../../core/hooks/use-success-transition";

export function AuthCallback({ redirectTo }: { redirectTo?: string }) {
  const {
    hooks: { useIsRestoring },
    persistClient,
  } = useAuth();

  const isRestoring = useIsRestoring?.();
  const isRedirecting = useRef(false);

  const { onSuccess } = useOnSuccessTransition({ redirectTo });

  useEffect(() => {
    if (isRedirecting.current) return;

    if (!persistClient) {
      isRedirecting.current = true;
      onSuccess();
      return;
    }

    if (isRestoring) return;

    isRedirecting.current = true;
    onSuccess();
  }, [isRestoring, persistClient, onSuccess]);

  return <Loader2 className="animate-spin" />;
}
