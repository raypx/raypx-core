import { z } from "zod"

const AppSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  url: z.string().min(1),
  githubUrl: z.string().min(1),
})

export const app = AppSchema.parse({
  name: "Raypx",
  description:
    "A modern web application platform built with Next.js and TypeScript for building AI-powered applications.",
  keywords: [
    "Raypx",
    "AI",
    "Platform",
    "Framework",
    "Next.js",
    "TypeScript",
    "React",
  ],
  url: "https://raypx.com",
  githubUrl: "https://github.com/raypx/raypx",
} satisfies z.infer<typeof AppSchema>)

export default app
