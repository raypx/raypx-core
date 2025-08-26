import { z } from "zod"

const AppSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  url: z.string().min(1),
  year: z.number().min(1).max(new Date().getFullYear()),
})

const app = AppSchema.parse({
  name: "Raypx",
  description: "Raypx is a platform for building AI-powered applications.",
  keywords: ["Raypx", "AI", "Platform", "Framework"],
  url: "https://raypx.com",
  year: 2025,
} satisfies z.infer<typeof AppSchema>)

export default app
