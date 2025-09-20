"use client";

import type { SettingsCardClassNames } from "@raypx/ui/components/settings";
import { SettingsCard } from "@raypx/ui/components/settings";
import { useState } from "react";
import { useAuth } from "../../core/hooks/use-auth";
import { DeleteAccountDialog } from "./delete-account-dialog";

export interface DeleteAccountCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  accounts?: { provider: string }[] | null;
  isPending?: boolean;
  skipHook?: boolean;
}

export function DeleteAccountCard({
  className,
  classNames,
  accounts,
  isPending,
  skipHook,
}: DeleteAccountCardProps) {
  const {
    hooks: { useListAccounts },
    t,
  } = useAuth();

  const [showDialog, setShowDialog] = useState(false);

  if (!skipHook) {
    const result = useListAccounts();
    accounts = result.data;
    isPending = result.isPending;
  }

  return (
    <div>
      <SettingsCard
        className={className}
        classNames={classNames}
        actionLabel={t("DELETE_ACCOUNT")}
        description={t("DELETE_ACCOUNT_DESCRIPTION")}
        isPending={isPending}
        title={t("DELETE_ACCOUNT")}
        variant="destructive"
        action={() => setShowDialog(true)}
      />

      <DeleteAccountDialog
        classNames={classNames}
        accounts={accounts}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </div>
  );
}
