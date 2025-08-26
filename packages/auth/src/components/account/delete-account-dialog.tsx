"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@raypx/ui/components/button"
import { Card } from "@raypx/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/ui/components/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@raypx/ui/components/form"
import { Loader2 } from "@raypx/ui/components/icons"
import { Input } from "@raypx/ui/components/input"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import type { ComponentProps } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { useAuth } from "../../core/hooks/use-auth"
import { getLocalizedError } from "../../core/lib/utils"
import { UserView } from "./user-view"

export interface DeleteAccountDialogProps
  extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames
  accounts?: { provider: string }[] | null
}

export function DeleteAccountDialog({
  classNames,
  accounts,
  onOpenChange,
  ...props
}: DeleteAccountDialogProps) {
  const {
    authClient,
    basePath,
    baseURL,
    deleteUser,
    freshAge,
    hooks: { useSession },
    t,
    viewPaths,
    navigate,
    toast,
  } = useAuth()

  const { data: sessionData } = useSession()
  const session = sessionData?.session
  const user = sessionData?.user

  const isFresh = session
    ? Date.now() - new Date(session?.createdAt).getTime() < freshAge * 1000
    : false
  const credentialsLinked = accounts?.some(
    (acc) => acc.provider === "credential",
  )

  const formSchema = z.object({
    password: credentialsLinked
      ? z.string().min(1, { message: t("PASSWORD_REQUIRED") })
      : z.string().optional(),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  })

  const { isSubmitting } = form.formState

  const deleteAccount = async ({ password }: z.infer<typeof formSchema>) => {
    const params = {} as Record<string, string>

    if (credentialsLinked) {
      params.password = password || ""
    } else if (!isFresh) {
      navigate(`${basePath}/${viewPaths.SIGN_OUT}`)
      return
    }

    if (deleteUser?.verification) {
      params.callbackURL = `${baseURL}${basePath}/${viewPaths.SIGN_OUT}`
    }

    try {
      await authClient.deleteUser({
        ...params,
        fetchOptions: {
          throw: true,
        },
      })

      if (deleteUser?.verification) {
        toast({
          variant: "success",
          message: t("DELETE_ACCOUNT_VERIFY"),
        })
      } else {
        toast({
          variant: "success",
          message: t("DELETE_ACCOUNT_SUCCESS"),
        })
        navigate(`${basePath}/${viewPaths.SIGN_OUT}`)
      }
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }

    onOpenChange?.(false)
  }

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={cn("sm:max-w-md", classNames?.dialog?.content)}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {t("DELETE_ACCOUNT")}
          </DialogTitle>

          <DialogDescription
            className={cn("text-xs md:text-sm", classNames?.description)}
          >
            {isFresh
              ? t("DELETE_ACCOUNT_INSTRUCTIONS")
              : t("SESSION_NOT_FRESH")}
          </DialogDescription>
        </DialogHeader>

        <Card className={cn("my-2 flex-row p-4", classNames?.cell)}>
          <UserView user={user} />
        </Card>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(deleteAccount)}
            className="grid gap-6"
          >
            {credentialsLinked && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={classNames?.label}>
                      {t("PASSWORD")}
                    </FormLabel>

                    <FormControl>
                      <Input
                        autoComplete="current-password"
                        placeholder={t("PASSWORD_PLACEHOLDER")}
                        type="password"
                        className={classNames?.input}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className={classNames?.error} />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className={classNames?.dialog?.footer}>
              <Button
                type="button"
                variant="secondary"
                className={cn(classNames?.button, classNames?.secondaryButton)}
                onClick={() => onOpenChange?.(false)}
              >
                {t("CANCEL")}
              </Button>

              <Button
                className={cn(
                  classNames?.button,
                  classNames?.destructiveButton,
                )}
                disabled={isSubmitting}
                variant="destructive"
                type="submit"
              >
                {isSubmitting && <Loader2 className="animate-spin" />}
                {isFresh ? t("DELETE_ACCOUNT") : t("SIGN_OUT")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
