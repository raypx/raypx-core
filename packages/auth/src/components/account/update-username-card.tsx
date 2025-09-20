"use client";

import type { SettingsCardProps } from "@raypx/ui/components/settings";
import { z } from "zod/v4";
import { useAuth } from "../../core/hooks/use-auth";
import type { User } from "../../types";
import { UpdateFieldCard } from "./update-field-card";

export function UpdateUsernameCard({ className, classNames, ...props }: SettingsCardProps) {
  const {
    hooks: { useSession },
    t,
  } = useAuth();

  const { data: sessionData } = useSession();
  const value =
    (sessionData?.user as User)?.displayUsername || (sessionData?.user as User)?.username;

  const validationSchema = z
    .string()
    .min(1, {
      message: t("FIELD_IS_REQUIRED", {
        field: t("USERNAME"),
      }),
    })
    .max(32, {
      message: t("FIELD_IN_CHARACTER_LIMIT", {
        limit: 32,
        field: t("USERNAME"),
      }),
    });

  return (
    <UpdateFieldCard
      className={className}
      classNames={classNames}
      value={value}
      description={t("USERNAME_DESCRIPTION")}
      name="username"
      instructions={t("USERNAME_INSTRUCTIONS")}
      label={t("USERNAME")}
      placeholder={t("USERNAME_PLACEHOLDER")}
      required
      validationSchema={validationSchema}
      {...props}
    />
  );
}
