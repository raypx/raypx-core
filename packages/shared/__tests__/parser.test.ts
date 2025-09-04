import { describe, expect, it } from "vitest"
import { UAParser } from "../src/utils/parser"

describe("parser utilities", () => {
  describe("UAParser", () => {
    it("should parse a Chrome user agent string", () => {
      const chromeUA =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

      const parser = new UAParser(chromeUA)
      const result = parser.getResult()

      expect(result.browser.name).toBe("Chrome")
      expect(result.os.name).toBe("macOS")
      expect(result.device.type).toBeUndefined() // Desktop doesn't have device type
    })

    it("should parse a Safari user agent string", () => {
      const safariUA =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15"

      const parser = new UAParser(safariUA)
      const result = parser.getResult()

      expect(result.browser.name).toBe("Safari")
      expect(result.os.name).toBe("macOS")
    })

    it("should parse a mobile user agent string", () => {
      const mobileUA =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

      const parser = new UAParser(mobileUA)
      const result = parser.getResult()

      expect(result.browser.name).toBe("Mobile Safari")
      expect(result.os.name).toBe("iOS")
      expect(result.device.type).toBe("mobile")
    })

    it("should handle empty user agent string", () => {
      const parser = new UAParser("")
      const result = parser.getResult()

      expect(result.browser.name).toBeUndefined()
      expect(result.os.name).toBeUndefined()
    })
  })
})
