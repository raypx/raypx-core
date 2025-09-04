import { Badge } from "@raypx/ui/components/badge"
import { Button } from "@raypx/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/ui/components/card"
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
} from "lucide-react"
import { SettingsButton } from "@/components/settings-button"

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
  ]

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
  ]

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
  ]

  const customActions = [
    {
      name: "Settings",
      component: (
        <SettingsButton variant="outline" size="sm">
          Settings
        </SettingsButton>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <TrendingUp className="mr-1 h-3 w-3" />
            +12.5% from last month
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2">
                {stat.changeType === "positive" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={`text-xs ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">
                  from last month
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.name}
                variant={action.variant}
                className="w-full justify-start"
                asChild
              >
                <a href={action.href}>
                  <action.icon className="mr-2 h-4 w-4" />
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
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>Key performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  User Growth
                </span>
                <span className="text-sm font-medium">+12.5%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "75%" }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Content Engagement
                </span>
                <span className="text-sm font-medium">+8.2%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "60%" }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  API Performance
                </span>
                <span className="text-sm font-medium">+23.1%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "90%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Monthly performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Chart component will be integrated here
              </p>
              <p className="text-xs text-muted-foreground">
                Showing data visualization for better insights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
