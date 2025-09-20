"use client";

import { CardContent } from "@raypx/ui/components/card";
import type { SettingsCardClassNames } from "@raypx/ui/components/settings";
import { SettingsCard } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import { useAuth } from "../../core/hooks/use-auth";
import { AccountCell } from "./account-cell";

export interface AccountsCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
}

export function AccountsCard({ className, classNames }: AccountsCardProps) {
  const {
    basePath,
    hooks: { useListDeviceSessions, useSession },
    t,
    viewPaths,
    navigate,
  } = useAuth();

  const { data: deviceSessions, isPending, refetch } = useListDeviceSessions();
  const { data: sessionData } = useSession();

  const otherDeviceSessions = (deviceSessions || []).filter(
    (ds) => ds.session.id !== sessionData?.session.id,
  );

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      title={t("ACCOUNTS")}
      description={t("ACCOUNTS_DESCRIPTION")}
      actionLabel={t("ADD_ACCOUNT")}
      instructions={t("ACCOUNTS_INSTRUCTIONS")}
      isPending={isPending}
      action={() => navigate(`${basePath}/${viewPaths.SIGN_IN}`)}
    >
      {deviceSessions?.length && (
        <CardContent className={cn("grid gap-4", classNames?.content)}>
          {sessionData && (
            <AccountCell classNames={classNames} deviceSession={sessionData} refetch={refetch} />
          )}

          {otherDeviceSessions.map((deviceSession) => (
            <AccountCell
              key={deviceSession.session.id}
              classNames={classNames}
              deviceSession={deviceSession}
              refetch={refetch}
            />
          ))}
        </CardContent>
      )}
    </SettingsCard>
  );
}
