import { z } from "zod"

const PathsSchema = z.object({
  app: z.object({
    home: z.string().min(1),
  }),
})

const pathsConfig = PathsSchema.parse({
  app: {
    home: "/",
  },
} satisfies z.infer<typeof PathsSchema>)

export default pathsConfig
