"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CardContent } from "@raypx/ui/components/card";
import { Checkbox } from "@raypx/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@raypx/ui/components/form";
import { Input } from "@raypx/ui/components/input";
import { SettingsCard, type SettingsCardClassNames } from "@raypx/ui/components/settings";
import { Skeleton } from "@raypx/ui/components/skeleton";
import { Textarea } from "@raypx/ui/components/textarea";
import { cn } from "@raypx/ui/lib/utils";
import { type ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useAuth } from "../../core/hooks/use-auth";
import { useDebouncedValidation } from "../../core/hooks/use-debounce";
import { getLocalizedError } from "../../core/lib/utils";
import type { FieldType } from "../../types";

export interface UpdateFieldCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  description?: ReactNode;
  instructions?: ReactNode;
  name: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
  type?: FieldType;
  multiline?: boolean;
  value?: unknown;
  validate?: (value: string) => boolean | Promise<boolean>;
  validationSchema?: z.ZodType<unknown>;
}

export function UpdateFieldCard({
  className,
  classNames,
  description,
  instructions,
  name,
  placeholder,
  required,
  label,
  type,
  multiline,
  value,
  validate,
  validationSchema,
}: UpdateFieldCardProps) {
  const {
    hooks: { useSession },
    mutators: { updateUser },
    t,
    optimistic,
    toast,
  } = useAuth();

  const { isPending } = useSession();

  let fieldSchema = z.unknown() as z.ZodType<unknown>;

  // Create the appropriate schema based on type
  if (type === "number") {
    fieldSchema = required
      ? z.preprocess(
          (val) => (!val ? undefined : Number(val)),
          z.number({
            error: (issue) => {
              if (!issue.input) {
                return t("FIELD_IS_REQUIRED", { field: label || "" });
              }
              if (issue.code === "invalid_type") {
                return `${label} ${t("IS_INVALID")}`;
              }
            },
          }),
        )
      : z.coerce
          .number({
            error: (issue) => {
              if (issue.code === "invalid_type") {
                return `${label} ${t("IS_INVALID")}`;
              }
            },
          })
          .optional();
  } else if (type === "boolean") {
    fieldSchema = required
      ? z.coerce
          .boolean({
            error: (issue) => {
              if (!issue.input) {
                return t("FIELD_IS_REQUIRED", { field: label || "" });
              }
              if (issue.code === "invalid_type") {
                return `${label} ${t("IS_INVALID")}`;
              }
            },
          })
          .refine((val) => val === true, {
            message: t("FIELD_IS_REQUIRED", { field: label || "" }),
          })
      : z.coerce.boolean({
          error: (issue) => {
            if (issue.code === "invalid_type") {
              return `${label} ${t("IS_INVALID")}`;
            }
          },
        });
  } else {
    fieldSchema = required
      ? z.string().min(1, t("FIELD_IS_REQUIRED", { field: label || "" }))
      : z.string().optional();
  }

  // Apply external validation schema if provided
  if (validationSchema) {
    fieldSchema = validationSchema;
  }

  const form = useForm({
    resolver: zodResolver(z.object({ [name]: fieldSchema })),
    values: { [name]: value || "" },
  });

  const { isSubmitting } = form.formState;
  const watchedValue = form.watch(name);

  // Add debounced validation for real-time feedback
  const { error: validationError, isValidating } = useDebouncedValidation(
    watchedValue,
    async (val) => {
      if (!val || val === value) {
        return null;
      }

      // First, run external Zod schema validation if provided
      if (validationSchema) {
        try {
          validationSchema.parse(val);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return getLocalizedError({ error, t });
          }
          return `${label} ${t("IS_INVALID")}`;
        }
      }

      // Then run custom validation function if provided
      if (validate && typeof val === "string") {
        try {
          const isValid = await validate(val);
          return isValid ? null : `${label} ${t("IS_INVALID")}`;
        } catch {
          return `${label} ${t("IS_INVALID")}`;
        }
      }

      return null;
    },
    500, // 500ms delay for validation
  );

  // Update form errors when debounced validation completes
  useEffect(() => {
    if (validationError && watchedValue !== value) {
      form.setError(name, { message: validationError });
    } else if (!validationError && form.formState.errors[name]) {
      form.clearErrors(name);
    }
  }, [validationError, form, name, watchedValue, value]);

  const updateField = async (values: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve));
    const newValue = values[name];

    if (value === newValue) {
      toast({
        variant: "error",
        message: `${label} ${t("IS_THE_SAME")}`,
      });
      return;
    }

    // Validate with external schema first
    if (validationSchema) {
      try {
        validationSchema.parse(newValue);
      } catch (error) {
        if (error instanceof z.ZodError) {
          form.setError(name, {
            message: getLocalizedError({ error, t }),
          });
        } else {
          form.setError(name, {
            message: `${label} ${t("IS_INVALID")}`,
          });
        }
        return;
      }
    }

    // Then validate with custom function
    if (validate && typeof newValue === "string" && !(await validate(newValue))) {
      form.setError(name, {
        message: `${label} ${t("IS_INVALID")}`,
      });

      return;
    }

    try {
      await updateUser({ [name]: newValue });

      toast({
        variant: "success",
        message: `${label} ${t("UPDATED_SUCCESSFULLY")}`,
      });
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(updateField)}>
        <SettingsCard
          className={className}
          classNames={classNames}
          description={description}
          instructions={instructions}
          isPending={isPending}
          title={label}
          actionLabel={t("SAVE")}
          optimistic={optimistic}
        >
          <CardContent className={classNames?.content}>
            {type === "boolean" ? (
              <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem className="flex">
                    <FormControl>
                      <Checkbox
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                        className={classNames?.checkbox}
                      />
                    </FormControl>

                    <FormLabel className={classNames?.label}>{label}</FormLabel>

                    <FormMessage className={classNames?.error} />
                  </FormItem>
                )}
              />
            ) : isPending ? (
              <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
            ) : (
              <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {type === "number" ? (
                        <Input
                          className={cn(
                            classNames?.input,
                            isValidating && "opacity-75",
                            validationError && "border-destructive",
                          )}
                          type="number"
                          placeholder={placeholder || (typeof label === "string" ? label : "")}
                          disabled={isSubmitting || isValidating}
                          {...field}
                          value={field.value as string}
                        />
                      ) : multiline ? (
                        <Textarea
                          className={cn(
                            classNames?.input,
                            isValidating && "opacity-75",
                            validationError && "border-destructive",
                          )}
                          placeholder={placeholder || (typeof label === "string" ? label : "")}
                          disabled={isSubmitting || isValidating}
                          {...field}
                          value={field.value as string}
                        />
                      ) : (
                        <Input
                          className={cn(
                            classNames?.input,
                            isValidating && "opacity-75",
                            validationError && "border-destructive",
                          )}
                          type="text"
                          placeholder={placeholder || (typeof label === "string" ? label : "")}
                          disabled={isSubmitting || isValidating}
                          {...field}
                          value={field.value as string}
                        />
                      )}
                    </FormControl>

                    <FormMessage className={classNames?.error} />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </SettingsCard>
      </form>
    </Form>
  );
}
