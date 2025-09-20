"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@raypx/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@raypx/ui/components/form";
import { Loader2 } from "@raypx/ui/components/icons";
import { PasswordField } from "@raypx/ui/components/password-field";
import { cn } from "@raypx/ui/lib/utils";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useAuth } from "../../core/hooks/use-auth";
import { buildAuthUrl } from "../../core/lib/url-utils";
import { getLocalizedError, getPasswordSchema } from "../../core/lib/utils";
import type { PasswordValidation } from "../../types";
import type { AuthFormClassNames } from "./auth-form";

export interface ResetPasswordFormProps {
  className?: string;
  classNames?: AuthFormClassNames;
  passwordValidation?: PasswordValidation;
}

export function ResetPasswordForm({
  className,
  classNames,
  passwordValidation,
}: ResetPasswordFormProps) {
  const tokenChecked = useRef(false);

  const { authClient, basePath, credentials, viewPaths, navigate, toast, t } = useAuth();

  const confirmPasswordEnabled = credentials?.confirmPassword;
  const contextPasswordValidation = credentials?.passwordValidation;

  passwordValidation = { ...contextPasswordValidation, ...passwordValidation };

  const formSchema = z
    .object({
      newPassword: getPasswordSchema(passwordValidation, {
        PASSWORD_REQUIRED: t("NEW_PASSWORD_REQUIRED"),
        PASSWORD_TOO_SHORT: t("PASSWORD_TOO_SHORT"),
        PASSWORD_TOO_LONG: t("PASSWORD_TOO_LONG"),
        INVALID_PASSWORD: t("INVALID_PASSWORD"),
      }),
      confirmPassword: confirmPasswordEnabled
        ? getPasswordSchema(passwordValidation, {
            PASSWORD_REQUIRED: t("CONFIRM_PASSWORD_REQUIRED"),
            PASSWORD_TOO_SHORT: t("PASSWORD_TOO_SHORT"),
            PASSWORD_TOO_LONG: t("PASSWORD_TOO_LONG"),
            INVALID_PASSWORD: t("INVALID_PASSWORD"),
          })
        : z.string().optional(),
    })
    .refine((data) => !confirmPasswordEnabled || data.newPassword === data.confirmPassword, {
      message: t("PASSWORDS_DO_NOT_MATCH"),
      path: ["confirmPassword"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (tokenChecked.current) return;
    tokenChecked.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");

    if (!token || token === "INVALID_TOKEN") {
      navigate(buildAuthUrl(basePath, viewPaths.SIGN_IN, true));
      toast({ variant: "error", message: t("INVALID_TOKEN") });
    }
  }, [basePath, navigate, toast, viewPaths, t]);

  async function resetPassword({ newPassword }: z.infer<typeof formSchema>) {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("token") as string;

      await authClient.resetPassword({
        newPassword,
        token,
        fetchOptions: { throw: true },
      });

      toast({
        variant: "success",
        message: t("RESET_PASSWORD_SUCCESS"),
      });

      navigate(buildAuthUrl(basePath, viewPaths.SIGN_IN, false));
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });

      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(resetPassword)}
        className={cn("grid w-full gap-6", className, classNames?.base)}
      >
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={classNames?.label}>{t("NEW_PASSWORD")}</FormLabel>

              <FormControl>
                <PasswordField
                  autoComplete="new-password"
                  className={classNames?.input}
                  placeholder={t("NEW_PASSWORD_PLACEHOLDER")}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage className={classNames?.error} />
            </FormItem>
          )}
        />

        {confirmPasswordEnabled && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={classNames?.label}>{t("CONFIRM_PASSWORD")}</FormLabel>

                <FormControl>
                  <PasswordField
                    autoComplete="new-password"
                    className={classNames?.input}
                    placeholder={t("CONFIRM_PASSWORD_PLACEHOLDER")}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>

                <FormMessage className={classNames?.error} />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn("w-full", classNames?.button, classNames?.primaryButton)}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : t("RESET_PASSWORD_ACTION")}
        </Button>
      </form>
    </Form>
  );
}
