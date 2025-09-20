import { createConfig } from "@raypx/next-config";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

export default createConfig({
  withMDX,
  i18n: "./config/i18n.config.ts",
});
