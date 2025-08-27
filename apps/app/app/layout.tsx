import type { Metadata } from "next"
import "../styles/globals.css"

export const metadata: Metadata = {
  title: "Raypx App",
  description: "Raypx platform application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
