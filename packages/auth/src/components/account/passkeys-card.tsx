"use client";

import { CardContent } from "@raypx/ui/components/card";
import { Form } from "@raypx/ui/components/form";
import type { SettingsCardClassNames } from "@raypx/ui/components/settings";
import { SettingsCard } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../core/hooks/use-auth";
import { getLocalizedError } from "../../core/lib/utils";
import { SessionFreshnessDialog } from "../core/session-freshness-dialog";
import { PasskeyCell } from "./passkey-cell";

export interface PasskeysCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
}

export function PasskeysCard({ className, classNames }: PasskeysCardProps) {
  const {
    authClient,
    freshAge,
    hooks: { useListPasskeys, useSession },
    t,
    toast,
  } = useAuth();

  const { data: passkeys, isPending, refetch } = useListPasskeys();

  const { data: sessionData } = useSession();
  const session = sessionData?.session;
  const isFresh = session
    ? Date.now() - new Date(session?.createdAt).getTime() < freshAge * 1000
    : false;

  const [showFreshnessDialog, setShowFreshnessDialog] = useState(false);

  const addPasskey = async () => {
    // If session isn't fresh, show the freshness dialog
    if (!isFresh) {
      setShowFreshnessDialog(true);
      return;
    }

    try {
      await authClient.passkey.addPasskey({
        fetchOptions: { throw: true },
      });
      await refetch?.();
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });
    }
  };

  const form = useForm();

  return (
    <>
      <SessionFreshnessDialog
        open={showFreshnessDialog}
        onOpenChange={setShowFreshnessDialog}
        classNames={classNames}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(addPasskey)}>
          <SettingsCard
            className={className}
            classNames={classNames}
            actionLabel={t("ADD_PASSKEY")}
            description={t("PASSKEYS_DESCRIPTION")}
            instructions={t("PASSKEYS_INSTRUCTIONS")}
            isPending={isPending}
            title={t("PASSKEYS")}
          >
            {passkeys && passkeys.length > 0 && (
              <CardContent className={cn("grid gap-4", classNames?.content)}>
                {passkeys?.map((passkey) => (
                  <PasskeyCell key={passkey.id} classNames={classNames} passkey={passkey} />
                ))}
              </CardContent>
            )}
          </SettingsCard>
        </form>
      </Form>
    </>
  );
}
