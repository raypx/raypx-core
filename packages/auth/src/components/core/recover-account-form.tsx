"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@raypx/ui/components/button"
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
import { cn } from "@raypx/ui/lib/utils"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { useAuth } from "../../core/hooks/use-auth"
import { useOnSuccessTransition } from "../../core/hooks/use-success-transition"
import { getLocalizedError } from "../../core/lib/utils"
import type { AuthFormClassNames } from "./auth-form"

export interface RecoverAccountFormProps {
  className?: string
  classNames?: AuthFormClassNames
  isSubmitting?: boolean
  redirectTo?: string
  setIsSubmitting?: (value: boolean) => void
}

export function RecoverAccountForm({
  className,
  classNames,
  isSubmitting,
  redirectTo,
  setIsSubmitting,
}: RecoverAccountFormProps) {
  const { authClient, t, toast } = useAuth()

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  })

  const formSchema = z.object({
    code: z.string().min(1, { message: t("BACKUP_CODE_REQUIRED") }),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  })

  isSubmitting =
    isSubmitting || form.formState.isSubmitting || transitionPending

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending)
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting])

  async function verifyBackupCode({ code }: z.infer<typeof formSchema>) {
    try {
      await authClient.twoFactor.verifyBackupCode({
        code,
        fetchOptions: { throw: true },
      })

      await onSuccess()
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })

      form.reset()
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(verifyBackupCode)}
        className={cn("grid gap-6", className, classNames?.base)}
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={classNames?.label}>
                {t("BACKUP_CODE")}
              </FormLabel>

              <FormControl>
                <Input
                  placeholder={t("BACKUP_CODE_PLACEHOLDER")}
                  autoComplete="off"
                  className={classNames?.input}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage className={classNames?.error} />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(classNames?.button, classNames?.primaryButton)}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            t("RECOVER_ACCOUNT_ACTION")
          )}
        </Button>
      </form>
    </Form>
  )
}
