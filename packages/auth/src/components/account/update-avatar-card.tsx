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
import { type ComponentProps, useRef, useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { fileToBase64, resizeAndCropImage } from "../../core/lib/image-utils"
import { getLocalizedError } from "../../core/lib/utils"
import { UserAvatar } from "./user-avatar"

export interface UpdateAvatarCardProps extends ComponentProps<typeof Card> {
  className?: string
  classNames?: SettingsCardClassNames
}

export function UpdateAvatarCard({
  className,
  classNames,
  ...props
}: UpdateAvatarCardProps) {
  const {
    hooks: { useSession },
    mutators: { updateUser },
    optimistic,
    avatar,
    toast,
    t,
  } = useAuth()

  const { data: sessionData, isPending, refetch } = useSession()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAvatarChange = async (file: File) => {
    if (!sessionData || !avatar) return

    setLoading(true)
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

    if (!image) {
      setLoading(false)
      return
    }

    if (optimistic && !avatar.upload) setLoading(false)

    try {
      await updateUser({ image })
      await refetch?.()
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }

    setLoading(false)
  }

  const handleDeleteAvatar = async () => {
    if (!sessionData) return

    setLoading(true)

    try {
      // If a custom storage remover is provided, attempt to clean up the old asset first
      if (sessionData.user.image && avatar?.delete) {
        await avatar.delete(sessionData.user.image)
      }

      await updateUser({ image: null })
      await refetch?.()
    } catch (error) {
      toast({
        variant: "error",
        message: getLocalizedError({ error, t }),
      })
    }

    setLoading(false)
  }

  const openFileDialog = () => fileInputRef.current?.click()

  return (
    <Card
      className={cn("w-full pb-0 text-start", className, classNames?.base)}
      {...props}
    >
      <input
        ref={fileInputRef}
        accept="image/*"
        disabled={loading}
        hidden
        type="file"
        onChange={(e) => {
          const file = e.target.files?.item(0)
          if (file) handleAvatarChange(file)

          e.target.value = ""
        }}
      />

      <div className="flex justify-between">
        <SettingsCardHeader
          className="grow self-start"
          title={t("AVATAR")}
          description={t("AVATAR_DESCRIPTION")}
          isPending={isPending}
          classNames={classNames}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="me-6 size-fit rounded-full"
              size="icon"
              variant="ghost"
            >
              <UserAvatar
                isPending={isPending || loading}
                key={sessionData?.user.image}
                className="size-20 text-2xl"
                classNames={classNames?.avatar}
                user={sessionData?.user}
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem onClick={openFileDialog} disabled={loading}>
              <UploadCloud />
              {t("UPLOAD_AVATAR")}
            </DropdownMenuItem>
            {sessionData?.user.image && (
              <DropdownMenuItem
                onClick={handleDeleteAvatar}
                disabled={loading}
                variant="destructive"
              >
                <Trash />
                {t("DELETE_AVATAR")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SettingsCardFooter
        className="!py-5"
        instructions={t("AVATAR_INSTRUCTIONS")}
        classNames={classNames}
        isPending={isPending}
        isSubmitting={loading}
      />
    </Card>
  )
}
