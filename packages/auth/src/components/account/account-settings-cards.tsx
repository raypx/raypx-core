"use client";

import type { SettingsCardClassNames } from "@raypx/ui/components/settings";
import { cn } from "@raypx/ui/lib/utils";
import { useAuth } from "../../core/hooks/use-auth";
import type { User } from "../../types";
import { AccountsCard } from "./accounts-card";
import { ChangeEmailCard } from "./change-email-card";
import { UpdateAvatarCard } from "./update-avatar-card";
import { UpdateFieldCard } from "./update-field-card";
import { UpdateNameCard } from "./update-name-card";
import { UpdateUsernameCard } from "./update-username-card";

export function AccountSettingsCards({
  className,
  classNames,
}: {
  className?: string;
  classNames?: {
    card?: SettingsCardClassNames;
    cards?: string;
  };
}) {
  const {
    additionalFields,
    avatar,
    changeEmail,
    credentials,
    hooks: { useSession },
    multiSession,
    account: accountOptions,
  } = useAuth();

  const { data: sessionData } = useSession();

  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className, classNames?.cards)}>
      {accountOptions?.fields?.includes("image") && avatar && (
        <UpdateAvatarCard classNames={classNames?.card} />
      )}

      {credentials?.username && <UpdateUsernameCard classNames={classNames?.card} />}

      {accountOptions?.fields?.includes("name") && <UpdateNameCard classNames={classNames?.card} />}

      {changeEmail && <ChangeEmailCard classNames={classNames?.card} />}

      {accountOptions?.fields?.map((field) => {
        if (field === "image") return null;
        if (field === "name") return null;
        const additionalField = additionalFields?.[field];
        if (!additionalField) return null;

        const {
          label,
          description,
          instructions,
          placeholder,
          required,
          type,
          multiline,
          validate,
        } = additionalField;

        const defaultValue = (sessionData?.user as User)[field as keyof User] as unknown;

        return (
          <UpdateFieldCard
            key={field}
            classNames={classNames?.card}
            value={defaultValue}
            description={description}
            name={field}
            instructions={instructions}
            label={label}
            placeholder={placeholder}
            required={required}
            type={type}
            multiline={multiline}
            validate={validate}
          />
        );
      })}

      {multiSession && <AccountsCard classNames={classNames?.card} />}
    </div>
  );
}
