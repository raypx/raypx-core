import { describe, expect, it } from "vitest";
import { merge } from "../src/utils/lodash";

describe("lodash utilities", () => {
  describe("merge", () => {
    it("should merge two objects", () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };

      const result = merge(obj1, obj2);

      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4,
      });
    });

    it("should handle empty objects", () => {
      const result = merge({}, { a: 1 });
      expect(result).toEqual({ a: 1 });
    });

    it("should handle nested object merging", () => {
      const base = { config: { theme: "dark", layout: "grid" } };
      const override = { config: { theme: "light" } };

      const result = merge(base, override);

      expect(result.config.theme).toBe("light");
      expect(result.config.layout).toBe("grid");
    });
  });
});
