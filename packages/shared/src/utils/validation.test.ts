import { describe, expect, it } from "vitest"
import { isNotEmpty, isValidEmail, isValidUrl } from "./validation"

describe("validation utilities", () => {
  describe("isValidEmail", () => {
    it("should validate correct email formats", () => {
      expect(isValidEmail("test@example.com")).toBe(true)
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true)
      expect(isValidEmail("user+tag@example.org")).toBe(true)
    })

    it("should reject invalid email formats", () => {
      expect(isValidEmail("invalid")).toBe(false)
      expect(isValidEmail("invalid@")).toBe(false)
      expect(isValidEmail("@domain.com")).toBe(false)
      expect(isValidEmail("test@")).toBe(false)
      expect(isValidEmail("")).toBe(false)
    })
  })

  describe("isValidUrl", () => {
    it("should validate correct URL formats", () => {
      expect(isValidUrl("https://example.com")).toBe(true)
      expect(isValidUrl("http://localhost:3000")).toBe(true)
      expect(isValidUrl("ftp://files.example.com")).toBe(true)
    })

    it("should reject invalid URL formats", () => {
      expect(isValidUrl("invalid-url")).toBe(false)
      expect(isValidUrl("just-a-string")).toBe(false)
      expect(isValidUrl("")).toBe(false)
    })
  })

  describe("isNotEmpty", () => {
    it("should return true for non-empty strings", () => {
      expect(isNotEmpty("hello")).toBe(true)
      expect(isNotEmpty("   world   ")).toBe(true)
    })

    it("should return false for empty strings", () => {
      expect(isNotEmpty("")).toBe(false)
      expect(isNotEmpty("   ")).toBe(false)
      expect(isNotEmpty("\n\t")).toBe(false)
    })
  })
})
