import { pathsConfig } from "@raypx/config";
import { z } from "zod";

// Extended paths schema for web app specific needs
const ExtendedPathsSchema = z.object({
  app: z.object({
    home: z.string().min(1),
    dashboard: z.string().min(1),
    knowledge: z.string().min(1),
  }),
  docs: z.object({
    url: z.string().min(1),
  }),
  auth: z.object({
    signIn: z.string().min(1),
    signUp: z.string().min(1),
  }),
  marketing: z.object({
    home: z.string().min(1),
    pricing: z.string().min(1),
  }),
});

// Merge base config with web-specific paths
const webPathsConfig = ExtendedPathsSchema.parse({
  // From base config
  auth: pathsConfig.auth,
  app: {
    ...pathsConfig.app,
    home: "https://raypx.com", // Override for marketing home
  },
  marketing: pathsConfig.marketing,
  // Web-specific
  docs: {
    url: "https://docs.raypx.com",
  },
} satisfies z.infer<typeof ExtendedPathsSchema>);

export default webPathsConfig;
