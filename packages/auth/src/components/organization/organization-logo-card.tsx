"use client"

import { Button } from "@raypx/ui/components/button"
import { Card } from "@raypx/ui/components/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@raypx/ui/components/dropdown-menu"
import { Trash, UploadCloud } from "@raypx/ui/components/icons"
import type { SettingsCardClassNames } from "@raypx/ui/components/settings"
import {
  SettingsCardFooter,
  SettingsCardHeader,
} from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import type { Organization } from "better-auth/plugins/organization"
import { type ComponentProps, useRef, useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { useCurrentOrganization } from "../../core/hooks/use-current-organization"
import { fileToBase64, resizeAndCropImage } from "../../core/lib/image-utils"
import { getLocalizedError } from "../../core/lib/utils"
import { OrganizationLogo } from "./organization-logo"

export interface OrganizationLogoCardProps extends ComponentProps<typeof Card> {
  className?: string
  classNames?: SettingsCardClassNames
  slug?: string
}

export function OrganizationLogoCard({
  className,
  classNames,
  slug,
  ...props
}: OrganizationLogoCardProps) {
  const { t } = useAuth()

  const { data: organization } = useCurrentOrganization({ slug })

  if (!organization) {
    return (
      <Card
        className={cn("w-full pb-0 text-start", className, classNames?.base)}
        {...props}
      >
        <div className="flex justify-between">
          <SettingsCardHeader
            className="grow self-start"
            title={t("LOGO")}
            description={t("LOGO_DESCRIPTION")}
            isPending
            classNames={classNames}
          />

          <Button
            type="button"
            className="me-6 size-fit rounded-full"
            size="icon"
            variant="ghost"
            disabled
          >
            <OrganizationLogo
              isPending
              className="size-20 text-2xl"
              classNames={classNames?.avatar}
            />
          </Button>
        </div>

        <SettingsCardFooter
          className="!py-5"
          instructions={t("LOGO_INSTRUCTIONS")}
          classNames={classNames}
          isPending
        />
      </Card>
    )
  }

  return (
    <OrganizationLogoForm
      className={className}
      classNames={classNames}
      organization={organization}
      {...props}
    />
  )
}

function OrganizationLogoForm({
  className,
  classNames,
  organization,
  ...props
}: OrganizationLogoCardProps & { organization: Organization }) {
  const {
    hooks: { useHasPermission },
    t,
    organization: organizationOptions,
    mutators: { updateOrganization },
    toast,
  } = useAuth()

  const { refetch: refetchOrganization } = useCurrentOrganization({
    slug: organization.slug,
  })

  const { data: hasPermission, isPending: permissionPending } =
    useHasPermission({
      organizationId: organization.id,
      permissions: {
        organization: ["update"],
      },
    })

  const isPending = permissionPending

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogoChange = async (file: File) => {
    if (!organizationOptions?.logo || !hasPermission?.success) return

    setLoading(true)

    const resizedFile = await resizeAndCropImage(
      file,
      crypto.randomUUID(),
      organizationOptions.logo.size,
      organizationOptions.logo.extension,
    )

    let image: string | undefined | null

    if (organizationOptions.logo.upload) {
      image = await organizationOptions.logo.upload(resizedFile)
    } else {
      image = await fileToBase64(resizedFile)
    }

    if (!image) {
      setLoading(false)
      return
    }

    try {
      await updateOrganization({
        organizationId: organization.id,
        data: { logo: image },
      })

      await refetchOrganization?.()
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }

    setLoading(false)
  }

  const handleDeleteLogo = async () => {
    if (!hasPermission?.success) return

    setLoading(true)

    try {
      if (organization.logo) {
        await organizationOptions?.logo?.delete?.(organization.logo)
      }

      await updateOrganization({
        organizationId: organization.id,
        data: { logo: "" },
      })

      await refetchOrganization?.()
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }

    setLoading(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card
      className={cn("w-full pb-0 text-start", className, classNames?.base)}
      {...props}
    >
      <input
        ref={fileInputRef}
        accept="image/*"
        disabled={loading || !hasPermission?.success}
        hidden
        type="file"
        onChange={(e) => {
          const file = e.target.files?.item(0)
          if (file) handleLogoChange(file)

          e.target.value = ""
        }}
      />

      <div className="flex justify-between">
        <SettingsCardHeader
          className="grow self-start"
          title={t("LOGO")}
          description={t("LOGO_DESCRIPTION")}
          isPending={isPending}
          classNames={classNames}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className="me-6 size-fit rounded-full"
              size="icon"
              variant="ghost"
              disabled={!hasPermission?.success}
            >
              <OrganizationLogo
                isPending={isPending || loading}
                key={organization.logo}
                className="size-20 text-2xl"
                classNames={classNames?.avatar}
                organization={organization}
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem
              onClick={openFileDialog}
              disabled={loading || !hasPermission?.success}
            >
              <UploadCloud />

              {t("UPLOAD_LOGO")}
            </DropdownMenuItem>

            {organization.logo && (
              <DropdownMenuItem
                onClick={handleDeleteLogo}
                disabled={loading || !hasPermission?.success}
                variant="destructive"
              >
                <Trash />

                {t("DELETE_LOGO")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SettingsCardFooter
        className="!py-5"
        instructions={t("LOGO_INSTRUCTIONS")}
        classNames={classNames}
        isPending={isPending}
        isSubmitting={loading}
      />
    </Card>
  )
}
