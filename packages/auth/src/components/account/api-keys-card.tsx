"use client"

import { CardContent } from "@raypx/ui/components/card"
import type { SettingsCardProps } from "@raypx/ui/components/settings"
import { SettingsCard } from "@raypx/ui/components/settings"
import { cn } from "@raypx/ui/lib/utils"
import { useMemo, useState } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { ApiKeyCell } from "./api-key-cell"
import { ApiKeyDisplayDialog } from "./api-key-display-dialog"
import { CreateApiKeyDialog } from "./create-api-key-dialog"

export interface ApiKeysCardProps extends SettingsCardProps {
  organizationId?: string
}

export function ApiKeysCard({
  className,
  classNames,
  organizationId,
  ...props
}: ApiKeysCardProps) {
  const {
    hooks: { useListApiKeys },
    t,
  } = useAuth()

  const { data: apiKeys, isPending, refetch } = useListApiKeys()

  // Filter API keys by organizationId
  const filteredApiKeys = useMemo(() => {
    return apiKeys?.filter(
      (apiKey) => organizationId === apiKey.metadata?.organizationId,
    )
  }, [apiKeys, organizationId])

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [displayDialogOpen, setDisplayDialogOpen] = useState(false)
  const [createdApiKey, setCreatedApiKey] = useState("")

  const handleCreateApiKey = (apiKey: string) => {
    setCreatedApiKey(apiKey)
    setDisplayDialogOpen(true)
  }

  return (
    <>
      <SettingsCard
        className={className}
        classNames={classNames}
        actionLabel={t("CREATE_API_KEY")}
        description={t("API_KEYS_DESCRIPTION")}
        instructions={t("API_KEYS_INSTRUCTIONS")}
        isPending={isPending}
        title={t("API_KEYS")}
        action={() => setCreateDialogOpen(true)}
        {...props}
      >
        {filteredApiKeys && filteredApiKeys.length > 0 && (
          <CardContent className={cn("grid gap-4", classNames?.content)}>
            {filteredApiKeys?.map((apiKey) => (
              <ApiKeyCell
                key={apiKey.id}
                classNames={classNames}
                apiKey={apiKey}
                refetch={refetch}
              />
            ))}
          </CardContent>
        )}
      </SettingsCard>

      <CreateApiKeyDialog
        classNames={classNames}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateApiKey}
        refetch={refetch}
        organizationId={organizationId}
      />

      <ApiKeyDisplayDialog
        classNames={classNames}
        apiKey={createdApiKey}
        open={displayDialogOpen}
        onOpenChange={setDisplayDialogOpen}
      />
    </>
  )
}
