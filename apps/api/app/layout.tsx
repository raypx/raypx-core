import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raypx API",
  description: "Raypx platform API server",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
