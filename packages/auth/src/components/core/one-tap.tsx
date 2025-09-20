"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../../core/hooks/use-auth";
import { useOnSuccessTransition } from "../../core/hooks/use-success-transition";
import { getLocalizedError } from "../../core/lib/utils";

interface OneTapProps {
  redirectTo?: string;
}

export function OneTap({ redirectTo }: OneTapProps) {
  const { authClient, t, toast } = useAuth();
  const oneTapFetched = useRef(false);

  const { onSuccess } = useOnSuccessTransition({ redirectTo });

  useEffect(() => {
    if (oneTapFetched.current) return;
    oneTapFetched.current = true;

    try {
      authClient.oneTap({
        fetchOptions: {
          throw: true,
          onSuccess,
        },
      });
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });
    }
  }, [authClient, t, onSuccess, toast]);

  return null;
}
