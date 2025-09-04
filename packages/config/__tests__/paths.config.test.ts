import { describe, expect, it } from "vitest"
import pathsConfig from "../src/paths.config"

describe("paths config", () => {
  it("should have all required auth paths", () => {
    expect(pathsConfig.auth).toBeDefined()
    expect(pathsConfig.auth.signIn).toBe("/sign-in")
    expect(pathsConfig.auth.signUp).toBe("/sign-up")
    expect(pathsConfig.auth.callback).toBe("/auth/callback")
    expect(pathsConfig.auth.passwordReset).toBe("/password-reset")
    expect(pathsConfig.auth.passwordUpdate).toBe("/update-password")
    expect(pathsConfig.auth.verifyMfa).toBe("/verify-mfa")
  })

  it("should have all required app paths", () => {
    expect(pathsConfig.app).toBeDefined()
    expect(pathsConfig.app.home).toBe("/dashboard")
    expect(pathsConfig.app.dashboard).toBe("/dashboard")
    expect(pathsConfig.app.knowledge).toBe("/dashboard/knowledge")
    expect(pathsConfig.app.analytics).toBe("/dashboard/analytics")
  })

  it("should have all required marketing paths", () => {
    expect(pathsConfig.marketing).toBeDefined()
    expect(pathsConfig.marketing.home).toBe("/")
    expect(pathsConfig.marketing.pricing).toBe("/pricing")
    expect(pathsConfig.marketing.about).toBe("/about")
    expect(pathsConfig.marketing.contact).toBe("/contact")
    expect(pathsConfig.marketing.terms).toBe("/terms")
    expect(pathsConfig.marketing.privacy).toBe("/privacy")
  })

  it("should have consistent account patterns", () => {
    // Personal account paths should start with /account
    expect(pathsConfig.app.personalAccountSettings).toMatch(/^\/account\//)
    expect(pathsConfig.app.personalAccountBilling).toMatch(/^\/account\//)

    // Organization paths should use slug pattern
    expect(pathsConfig.app.accountHome).toBe("/orgs/[slug]")
    expect(pathsConfig.app.accountSettings).toBe("/orgs/[slug]/settings")
    expect(pathsConfig.app.accountMembers).toBe("/orgs/[slug]/members")
  })

  it("should have valid path strings", () => {
    // All paths should be strings and not empty
    const checkPaths = (obj: any, prefix = "") => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "object") {
          checkPaths(value, `${prefix}${key}.`)
        } else {
          expect(typeof value).toBe("string")
          expect(value).toBeTruthy()
          expect((value as string).length).toBeGreaterThan(0)
        }
      }
    }

    checkPaths(pathsConfig)
  })
})
