"use client";

import { Alert, AlertDescription, AlertTitle } from "@raypx/ui/components/alert";
import { AlertCircle } from "@raypx/ui/components/icons";
import { cn } from "@raypx/ui/lib/utils";
import { useFormState } from "react-hook-form";
import type { AuthFormClassNames } from "./auth-form";

export interface FormErrorProps {
  title?: string;
  classNames?: AuthFormClassNames;
}

export function FormError({ title, classNames }: FormErrorProps) {
  const { errors } = useFormState();

  if (!errors.root?.message) return null;

  return (
    <Alert variant="destructive" className={cn(classNames?.error)}>
      <AlertCircle className="self-center" />
      <AlertTitle>{title || "Error"}</AlertTitle>
      <AlertDescription>{errors.root.message}</AlertDescription>
    </Alert>
  );
}
