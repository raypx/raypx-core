"use client";

import { Button } from "@raypx/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/ui/components/card";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const router = useRouter();
  useEffect(() => {
    // Log error to error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb placeholder */}
      <div className="h-5 hidden sm:block" />

      {/* Error Card */}
      <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-lg sm:text-xl">Something went wrong</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              We encountered an error while loading the dashboard. This might be a temporary issue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === "development" && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs font-mono text-muted-foreground break-all">{error.message}</p>
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-1">Error ID: {error.digest}</p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={reset} className="w-full sm:flex-1" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="w-full sm:flex-1"
                size="sm"
              >
                Reload Dashboard
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              If the problem persists, please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
