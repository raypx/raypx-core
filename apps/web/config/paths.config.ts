import { z } from "zod"

const PathsSchema = z.object({
  app: z.object({
    home: z.string().min(1),
  }),
  docs: z.object({
    url: z.string().min(1),
  }),
})

const pathsConfig = PathsSchema.parse({
  app: {
    home: "https://raypx.com",
  },
  docs: {
    url: "https://docs.raypx.com",
  },
} satisfies z.infer<typeof PathsSchema>)

export default pathsConfig
