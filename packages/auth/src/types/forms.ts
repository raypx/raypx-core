import type { ComponentType, ReactNode } from "react"

export type FieldType = "string" | "number" | "boolean"

export interface AdditionalField {
  description?: ReactNode
  instructions?: ReactNode
  label: string
  placeholder?: string
  required?: boolean
  type: FieldType
  multiline?: boolean
  validate?: (value: string) => Promise<boolean>
}

export interface AdditionalFields {
  [key: string]: AdditionalField
}

export type Link = ComponentType<{
  href: string
  className?: string
  children: ReactNode
}>

type ToastVariant = "default" | "success" | "error" | "info" | "warning"

export type RenderToast = ({
  variant,
  message,
}: {
  variant?: ToastVariant
  message?: string
}) => void
