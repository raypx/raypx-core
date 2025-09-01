"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@raypx/ui/components/button"
import { Checkbox } from "@raypx/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@raypx/ui/components/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@raypx/ui/components/form"
import { Loader2, Trash, UploadCloud } from "@raypx/ui/components/icons"
import { Input } from "@raypx/ui/components/input"
import { PasswordField } from "@raypx/ui/components/password-field"
import { Textarea } from "@raypx/ui/components/textarea"
import type { BetterFetchOption } from "better-auth/react"
import { type RefObject, useCallback, useEffect, useRef, useState } from "react"
import type ReCAPTCHA from "react-google-recaptcha"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { useAuth } from "../../core/hooks/use-auth"
import { useCaptcha } from "../../core/hooks/use-captcha"
import { useIsHydrated } from "../../core/hooks/use-hydrated"
import { useOnSuccessTransition } from "../../core/hooks/use-success-transition"
import { fileToBase64, resizeAndCropImage } from "../../core/lib/image-utils"
import {
  cn,
  getLocalizedError,
  getPasswordSchema,
  getSearchParam,
} from "../../core/lib/utils"
import type { PasswordValidation } from "../../types"
import { UserAvatar } from "../account/user-avatar"
import type { AuthFormClassNames } from "./auth-form"
import { Captcha } from "./captcha"

export interface SignUpFormProps {
  className?: string
  classNames?: AuthFormClassNames
  callbackURL?: string
  isSubmitting?: boolean
  redirectTo?: string
  setIsSubmitting?: (value: boolean) => void
  passwordValidation?: PasswordValidation
}

export function SignUpForm({
  className,
  classNames,
  callbackURL,
  isSubmitting,
  redirectTo,
  setIsSubmitting,
  passwordValidation,
}: SignUpFormProps) {
  const isHydrated = useIsHydrated()
  const { captchaRef, getCaptchaHeaders, resetCaptcha } = useCaptcha()

  const {
    additionalFields,
    authClient,
    basePath,
    baseURL,
    credentials,
    t,
    nameRequired,
    persistClient,
    redirectTo: contextRedirectTo,
    signUp: signUpOptions,
    viewPaths,
    navigate,
    toast,
    avatar,
  } = useAuth()

  const confirmPasswordEnabled = credentials?.confirmPassword
  const usernameEnabled = credentials?.username
  const contextPasswordValidation = credentials?.passwordValidation
  const signUpFields = signUpOptions?.fields

  passwordValidation = { ...contextPasswordValidation, ...passwordValidation }

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const getRedirectTo = useCallback(
    () => redirectTo || getSearchParam("redirectTo") || contextRedirectTo,
    [redirectTo, contextRedirectTo],
  )

  const getCallbackURL = useCallback(
    () =>
      `${baseURL}${
        callbackURL ||
        (persistClient
          ? `${basePath}/${viewPaths.CALLBACK}?redirectTo=${getRedirectTo()}`
          : getRedirectTo())
      }`,
    [callbackURL, persistClient, basePath, viewPaths, baseURL, getRedirectTo],
  )

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  })

  // Create the base schema for standard fields
  const defaultFields = {
    email: z
      .email({
        message: `${t("EMAIL")} ${t("IS_INVALID")}`,
      })
      .min(1, {
        message: t("FIELD_IS_REQUIRED", { field: t("EMAIL") }),
      }),
    password: getPasswordSchema(passwordValidation, {
      PASSWORD_REQUIRED: t("PASSWORD_REQUIRED"),
      PASSWORD_TOO_SHORT: t("PASSWORD_TOO_SHORT"),
      PASSWORD_TOO_LONG: t("PASSWORD_TOO_LONG"),
      INVALID_PASSWORD: t("INVALID_PASSWORD"),
    }),
    name:
      signUpFields?.includes("name") && nameRequired
        ? z.string().min(1, {
            message: t("FIELD_IS_REQUIRED", { field: t("NAME") }),
          })
        : z.string().optional(),
    image: z.string().optional(),
    username: usernameEnabled
      ? z.string().min(1, {
          message: t("FIELD_IS_REQUIRED", { field: t("USERNAME") }),
        })
      : z.string().optional(),
    confirmPassword: confirmPasswordEnabled
      ? getPasswordSchema(passwordValidation, {
          PASSWORD_REQUIRED: t("CONFIRM_PASSWORD_REQUIRED"),
          PASSWORD_TOO_SHORT: t("PASSWORD_TOO_SHORT"),
          PASSWORD_TOO_LONG: t("PASSWORD_TOO_LONG"),
          INVALID_PASSWORD: t("INVALID_PASSWORD"),
        })
      : z.string().optional(),
  }

  const schemaFields: Record<string, z.ZodTypeAny> = {}

  // Add additional fields from signUpFields
  if (signUpFields) {
    for (const field of signUpFields) {
      if (field === "name") continue // Already handled above
      if (field === "image") continue // Already handled above

      const additionalField = additionalFields?.[field]
      if (!additionalField) continue

      let fieldSchema: z.ZodTypeAny

      // Create the appropriate schema based on field type
      if (additionalField.type === "number") {
        fieldSchema = additionalField.required
          ? z.preprocess(
              (val) => (!val ? undefined : Number(val)),
              z.number({
                error: `${additionalField.label} ${t("IS_INVALID")}`,
              }),
            )
          : z.coerce
              .number({
                error: `${additionalField.label} ${t("IS_INVALID")}`,
              })
              .optional()
      } else if (additionalField.type === "boolean") {
        fieldSchema = additionalField.required
          ? z.coerce
              .boolean({
                error: `${additionalField.label} ${t("IS_INVALID")}`,
              })
              .refine((val) => val === true, {
                message: t("FIELD_IS_REQUIRED", {
                  field: additionalField.label,
                }),
              })
          : z.coerce
              .boolean({
                error: `${additionalField.label} ${t("IS_INVALID")}`,
              })
              .optional()
      } else {
        fieldSchema = additionalField.required
          ? z
              .string()
              .min(1, t("FIELD_IS_REQUIRED", { field: additionalField.label }))
          : z.string().optional()
      }

      schemaFields[field] = fieldSchema
    }
  }

  const formSchema = z
    .object({
      ...defaultFields,
      ...schemaFields,
    })
    .loose()
    .refine(
      (data) => {
        // Skip validation if confirmPassword is not enabled
        if (!confirmPasswordEnabled) return true
        return data.password === data.confirmPassword
      },
      {
        message: t("PASSWORDS_DO_NOT_MATCH"),
        path: ["confirmPassword"],
      },
    )

  // Create default values for the form
  const defaultValues: Record<string, unknown> = {
    email: "",
    password: "",
    ...(confirmPasswordEnabled && { confirmPassword: "" }),
    ...(signUpFields?.includes("name") ? { name: "" } : {}),
    ...(usernameEnabled ? { username: "" } : {}),
    ...(signUpFields?.includes("image") && avatar ? { image: "" } : {}),
  }

  // Add default values for additional fields
  if (signUpFields) {
    for (const field of signUpFields) {
      if (field === "name") continue
      if (field === "image") continue
      const additionalField = additionalFields?.[field]
      if (!additionalField) continue

      defaultValues[field] = additionalField.type === "boolean" ? false : ""
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  isSubmitting =
    isSubmitting || form.formState.isSubmitting || transitionPending

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending)
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting])

  const handleAvatarChange = async (file: File) => {
    if (!avatar) return

    setUploadingAvatar(true)

    try {
      const resizedFile = await resizeAndCropImage(
        file,
        crypto.randomUUID(),
        avatar.size,
        avatar.extension,
      )

      let image: string | undefined | null

      if (avatar.upload) {
        image = await avatar.upload(resizedFile)
      } else {
        image = await fileToBase64(resizedFile)
      }

      if (image) {
        setAvatarImage(image)
        form.setValue("image", image)
      } else {
        setAvatarImage(null)
        form.setValue("image", "")
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }

    setUploadingAvatar(false)
  }

  const handleDeleteAvatar = () => {
    setAvatarImage(null)
    form.setValue("image", "")
  }

  const openFileDialog = () => fileInputRef.current?.click()

  async function signUp({
    email,
    password,
    name,
    username,
    confirmPassword,
    image,
    ...additionalFieldValues
  }: z.infer<typeof formSchema>) {
    try {
      // Validate additional fields with custom validators if provided
      for (const [field, value] of Object.entries(additionalFieldValues)) {
        const additionalField = additionalFields?.[field]
        if (!additionalField?.validate) continue

        if (
          typeof value === "string" &&
          !(await additionalField.validate(value))
        ) {
          form.setError(field, {
            message: `${additionalField.label} ${t("IS_INVALID")}`,
          })
          return
        }
      }

      const fetchOptions: BetterFetchOption = {
        throw: true,
        headers: await getCaptchaHeaders("/sign-up/email"),
      }

      const additionalParams: Record<string, unknown> = {}

      if (username !== undefined) {
        additionalParams.username = username
      }

      if (image !== undefined) {
        additionalParams.image = image
      }

      const data = await authClient.signUp.email({
        email,
        password,
        name: name || "",
        ...additionalParams,
        ...additionalFieldValues,
        callbackURL: getCallbackURL(),
        fetchOptions,
      })

      if ("token" in data && data.token) {
        await onSuccess()
      } else {
        navigate(`${basePath}/${viewPaths.SIGN_IN}${window.location.search}`)
        toast({
          variant: "success",
          message: t("SIGN_UP_EMAIL"),
        })
      }
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })

      form.resetField("password")
      form.resetField("confirmPassword")
      resetCaptcha()
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(signUp)}
        noValidate={isHydrated}
        className={cn("grid w-full gap-6", className, classNames?.base)}
      >
        {signUpFields?.includes("image") && avatar && (
          <>
            <input
              ref={fileInputRef}
              accept="image/*"
              disabled={uploadingAvatar}
              hidden
              type="file"
              onChange={(e) => {
                const file = e.target.files?.item(0)
                if (file) handleAvatarChange(file)
                e.target.value = ""
              }}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>{t("AVATAR")}</FormLabel>

                  <div className="flex items-center gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="size-fit rounded-full"
                          size="icon"
                          variant="ghost"
                          type="button"
                        >
                          <UserAvatar
                            isPending={uploadingAvatar}
                            className="size-16"
                            user={
                              avatarImage
                                ? {
                                    name: form.watch("name") || "",
                                    email: form.watch("email"),
                                    image: avatarImage,
                                  }
                                : null
                            }
                          />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="start"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        <DropdownMenuItem
                          onClick={openFileDialog}
                          disabled={uploadingAvatar}
                        >
                          <UploadCloud />
                          {t("UPLOAD_AVATAR")}
                        </DropdownMenuItem>

                        {avatarImage && (
                          <DropdownMenuItem
                            onClick={handleDeleteAvatar}
                            disabled={uploadingAvatar}
                            variant="destructive"
                          >
                            <Trash />
                            {t("DELETE_AVATAR")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={openFileDialog}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar && <Loader2 className="animate-spin" />}

                      {t("UPLOAD")}
                    </Button>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {signUpFields?.includes("name") && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={classNames?.label}>{t("NAME")}</FormLabel>

                <FormControl>
                  <Input
                    className={classNames?.input}
                    placeholder={t("NAME_PLACEHOLDER")}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>

                <FormMessage className={classNames?.error} />
              </FormItem>
            )}
          />
        )}

        {usernameEnabled && (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={classNames?.label}>
                  {t("USERNAME")}
                </FormLabel>

                <FormControl>
                  <Input
                    className={classNames?.input}
                    placeholder={t("USERNAME_PLACEHOLDER")}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>

                <FormMessage className={classNames?.error} />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={classNames?.label}>{t("EMAIL")}</FormLabel>

              <FormControl>
                <Input
                  className={classNames?.input}
                  type="email"
                  placeholder={t("EMAIL_PLACEHOLDER")}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage className={classNames?.error} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={classNames?.label}>
                {t("PASSWORD")}
              </FormLabel>

              <FormControl>
                <PasswordField
                  autoComplete="new-password"
                  className={classNames?.input}
                  placeholder={t("PASSWORD_PLACEHOLDER")}
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
                <FormLabel className={classNames?.label}>
                  {t("CONFIRM_PASSWORD")}
                </FormLabel>

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

        {signUpFields
          ?.filter((field) => field !== "name" && field !== "image")
          .map((field) => {
            const additionalField = additionalFields?.[field]
            if (!additionalField) {
              console.error(`Additional field ${field} not found`)
              return null
            }

            return additionalField.type === "boolean" ? (
              <FormField
                key={field}
                control={form.control}
                name={field}
                render={({ field: formField }) => (
                  <FormItem className="flex">
                    <FormControl>
                      <Checkbox
                        checked={formField.value as boolean}
                        onCheckedChange={formField.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>

                    <FormLabel className={classNames?.label}>
                      {additionalField.label}
                    </FormLabel>

                    <FormMessage className={classNames?.error} />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                key={field}
                control={form.control}
                name={field}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel className={classNames?.label}>
                      {additionalField.label}
                    </FormLabel>

                    <FormControl>
                      {additionalField.type === "number" ? (
                        <Input
                          className={classNames?.input}
                          type="number"
                          placeholder={
                            additionalField.placeholder ||
                            (typeof additionalField.label === "string"
                              ? additionalField.label
                              : "")
                          }
                          disabled={isSubmitting}
                          {...formField}
                          value={formField.value as number}
                        />
                      ) : additionalField.multiline ? (
                        <Textarea
                          className={classNames?.input}
                          placeholder={
                            additionalField.placeholder ||
                            (typeof additionalField.label === "string"
                              ? additionalField.label
                              : "")
                          }
                          disabled={isSubmitting}
                          {...formField}
                          value={formField.value as string}
                        />
                      ) : (
                        <Input
                          className={classNames?.input}
                          type="text"
                          placeholder={
                            additionalField.placeholder ||
                            (typeof additionalField.label === "string"
                              ? additionalField.label
                              : "")
                          }
                          disabled={isSubmitting}
                          {...formField}
                          value={formField.value as string}
                        />
                      )}
                    </FormControl>

                    <FormMessage className={classNames?.error} />
                  </FormItem>
                )}
              />
            )
          })}

        <Captcha
          ref={captchaRef as RefObject<ReCAPTCHA>}
          action="/sign-up/email"
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full",
            classNames?.button,
            classNames?.primaryButton,
          )}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            t("SIGN_UP_ACTION")
          )}
        </Button>
      </form>
    </Form>
  )
}
