import type { ReactNode } from "react";

export interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return <div className="bg-background">{children}</div>;
}
