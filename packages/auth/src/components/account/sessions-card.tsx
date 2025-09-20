"use client";

import { CardContent } from "@raypx/ui/components/card";
import type { SettingsCardClassNames } from "@raypx/ui/components/settings";
import { SettingsCard } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import { useAuth } from "../../core/hooks/use-auth";
import { SessionCell } from "./session-cell";
import { SettingsCellSkeleton } from "./settings-cell-skeleton";

export interface SessionsCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
}

export function SessionsCard({ className, classNames }: SessionsCardProps) {
  const {
    hooks: { useListSessions },
    t,
  } = useAuth();

  const { data: sessions, isPending, refetch } = useListSessions();

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      description={t("SESSIONS_DESCRIPTION")}
      isPending={isPending}
      title={t("SESSIONS")}
    >
      <CardContent className={cn("grid gap-4", classNames?.content)}>
        {isPending ? (
          <SettingsCellSkeleton classNames={classNames} />
        ) : (
          sessions?.map((session) => (
            <SessionCell
              key={session.id}
              classNames={classNames}
              session={session}
              refetch={refetch}
            />
          ))
        )}
      </CardContent>
    </SettingsCard>
  );
}
