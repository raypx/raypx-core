"use client"

import { AuthView } from "@raypx/auth/core"

export default function SignOutPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <AuthView view="SIGN_OUT" />
    </div>
  )
}
