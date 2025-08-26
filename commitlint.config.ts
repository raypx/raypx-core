import type { UserConfig } from "@commitlint/types"

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [0, "always", Number.POSITIVE_INFINITY],
    "header-max-length": [0, "always", Number.POSITIVE_INFINITY],
  },
}

export default config
