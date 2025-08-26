"use client"

import { useEffect } from "react"
import { useAuth } from "../../core/hooks/use-auth"
import { useCurrentOrganization } from "../../core/hooks/use-current-organization"

export const OrganizationRefetcher = () => {
  const {
    hooks: { useListOrganizations, useSession },
    organization: organizationOptions,
    navigate,
    redirectTo,
  } = useAuth()

  const { slug, pathMode, personalPath } = organizationOptions || {}

  const { data: sessionData } = useSession()

  const {
    data: organization,
    isPending: organizationPending,
    isRefetching: organizationRefetching,
    refetch: refetchOrganization,
  } = useCurrentOrganization()

  const { refetch: refetchListOrganizations } = useListOrganizations()

  const { data: organizations } = useListOrganizations()

  useEffect(() => {
    if (!sessionData?.user.id) return

    if (organization || organizations) {
      refetchOrganization?.()
      refetchListOrganizations?.()
    }
  }, [sessionData?.user.id])

  useEffect(() => {
    if (organizationRefetching || organizationPending) return

    if (slug && pathMode === "slug" && !organization) {
      navigate(personalPath || redirectTo)
    }
  }, [
    organization,
    organizationRefetching,
    organizationPending,
    slug,
    pathMode,
    personalPath,
    navigate,
    redirectTo,
  ])

  return null
}
