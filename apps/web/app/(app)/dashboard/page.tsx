import { Badge } from "@raypx/ui/components/badge";
import { Button } from "@raypx/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/ui/components/card";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { SettingsButton } from "@/components/settings-button";

export default function ConsolePage() {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Users,
      description: "Active users this month",
    },
    {
      title: "Knowledge Base",
      value: "156",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: FileText,
      description: "Articles and documents",
    },
    {
      title: "API Requests",
      value: "89.2K",
      change: "+23.1%",
      changeType: "positive" as const,
      icon: Activity,
      description: "Requests this week",
    },
    {
      title: "Response Time",
      value: "142ms",
      change: "-5.3%",
      changeType: "negative" as const,
      icon: Clock,
      description: "Average response time",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New user registered",
      time: "2 minutes ago",
      type: "user",
    },
    {
      id: 2,
      action: "Knowledge article updated",
      time: "15 minutes ago",
      type: "content",
    },
    {
      id: 3,
      action: "API key generated",
      time: "1 hour ago",
      type: "security",
    },
    { id: 4, action: "Organization created", time: "2 hours ago", type: "org" },
    {
      id: 5,
      action: "Security alert resolved",
      time: "3 hours ago",
      type: "security",
    },
  ];

  const quickActions = [
    {
      name: "Add User",
      icon: Plus,
      href: "/dashboard/users",
      variant: "default" as const,
    },
    {
      name: "Create Article",
      icon: FileText,
      href: "/dashboard/knowledge",
      variant: "outline" as const,
    },
    {
      name: "View Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
      variant: "outline" as const,
    },
    {
      name: "Manage API Keys",
      icon: Activity,
      href: "/account/api-keys",
      variant: "outline" as const,
    },
  ];

  const customActions = [
    {
      name: "Settings",
      component: (
        <SettingsButton variant="outline" size="sm">
          Settings
        </SettingsButton>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <Badge variant="secondary" className="text-xs sm:text-sm">
            <TrendingUp className="mr-1 h-3 w-3" />
            <span className="hidden xs:inline">+12.5% from last month</span>
            <span className="xs:hidden">+12.5%</span>
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium leading-none">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                {stat.changeType === "positive" ? (
                  <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600 flex-shrink-0" />
                )}
                <span
                  className={`text-xs ${
                    stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  from last month
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed hidden sm:block">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Quick Actions */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.name}
                variant={action.variant}
                className="w-full justify-start h-9 sm:h-10 text-xs sm:text-sm"
                asChild
              >
                <a href={action.href}>
                  <action.icon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {action.name}
                </a>
              </Button>
            ))}
            {customActions.map((action) => (
              <div key={action.name} className="w-full">
                {action.component}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1.5">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Overview */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Analytics Overview</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Key performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">User Growth</span>
                  <span className="text-xs sm:text-sm font-medium">+12.5%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
                    style={{ width: "75%" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Content Engagement
                  </span>
                  <span className="text-xs sm:text-sm font-medium">+8.2%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
                    style={{ width: "60%" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">API Performance</span>
                  <span className="text-xs sm:text-sm font-medium">+23.1%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
                    style={{ width: "90%" }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Performance Trends</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Monthly performance overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 sm:h-64 lg:h-80 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg border border-dashed border-muted-foreground/20">
            <div className="text-center space-y-3">
              <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Chart component will be integrated here
                </p>
                <p className="text-xs text-muted-foreground/80 hidden sm:block">
                  Showing data visualization for better insights
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
