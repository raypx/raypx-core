"use client";

import { useSession } from "@raypx/auth/client";
import { format } from "date-fns";
import { Clock } from "lucide-react";

export interface DashboardWelcomeProps {
  title?: string;
  subtitle?: string;
  showLastLogin?: boolean;
}

export function DashboardWelcome({ title, subtitle, showLastLogin = true }: DashboardWelcomeProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const displayTitle = title || `Welcome back, ${user.name || user.email}!`;
  const displaySubtitle = subtitle || "Here's what's happening with your account today.";

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{displayTitle}</h1>
        <p className="text-muted-foreground">{displaySubtitle}</p>
      </div>
      {showLastLogin && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last login: {format(new Date(), "MMM dd, yyyy 'at' h:mm a")}</span>
        </div>
      )}
    </div>
  );
}
