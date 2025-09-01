"use client"

import { Badge } from "@raypx/ui/components/badge"
import { Button } from "@raypx/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/ui/components/card"
import { Input } from "@raypx/ui/components/input"
import {
  BookOpen,
  Calendar,
  Edit,
  Eye,
  FileText,
  Filter,
  Plus,
  Search,
  Tag,
  Trash2,
  User,
} from "lucide-react"

export default function KnowledgePage() {
  const articles = [
    {
      id: 1,
      title: "Getting Started with Raypx",
      excerpt:
        "Learn the basics of setting up and using Raypx for your organization.",
      category: "Tutorials",
      status: "published",
      author: "John Doe",
      publishDate: "2024-01-15",
      views: 1245,
      tags: ["beginner", "setup", "guide"],
    },
    {
      id: 2,
      title: "Advanced API Configuration",
      excerpt:
        "Deep dive into advanced API settings and optimization techniques.",
      category: "Technical",
      status: "published",
      author: "Jane Smith",
      publishDate: "2024-01-10",
      views: 892,
      tags: ["api", "advanced", "configuration"],
    },
    {
      id: 3,
      title: "User Management Best Practices",
      excerpt: "Best practices for managing users and permissions effectively.",
      category: "Administration",
      status: "draft",
      author: "Bob Johnson",
      publishDate: null,
      views: 0,
      tags: ["users", "permissions", "best-practices"],
    },
    {
      id: 4,
      title: "Security Guidelines",
      excerpt: "Comprehensive security guidelines for your Raypx deployment.",
      category: "Security",
      status: "published",
      author: "Alice Brown",
      publishDate: "2024-01-05",
      views: 1567,
      tags: ["security", "guidelines", "compliance"],
    },
    {
      id: 5,
      title: "Troubleshooting Common Issues",
      excerpt: "Solutions to frequently encountered problems and their fixes.",
      category: "Support",
      status: "published",
      author: "Charlie Wilson",
      publishDate: "2024-01-01",
      views: 2341,
      tags: ["troubleshooting", "support", "faq"],
    },
  ]

  const categories = [
    { name: "Tutorials", count: 12, color: "bg-blue-100 text-blue-800" },
    { name: "Technical", count: 8, color: "bg-green-100 text-green-800" },
    {
      name: "Administration",
      count: 6,
      color: "bg-purple-100 text-purple-800",
    },
    { name: "Security", count: 4, color: "bg-red-100 text-red-800" },
    { name: "Support", count: 10, color: "bg-yellow-100 text-yellow-800" },
  ]

  const stats = [
    { title: "Total Articles", value: "156", change: "+12.5%", icon: FileText },
    { title: "Published", value: "142", change: "+8.2%", icon: BookOpen },
    { title: "Drafts", value: "14", change: "+5.3%", icon: Edit },
    { title: "Total Views", value: "89.2K", change: "+23.1%", icon: Eye },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage your organization's knowledge articles and documentation.
          </p>
        </div>
        <Button className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Stats Cards */}
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
              <p className="text-xs text-muted-foreground">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Articles</CardTitle>
          <CardDescription>
            Find articles by title, content, or tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search articles..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Article distribution by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {categories.map((category) => (
              <div key={category.name} className="text-center">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.color}`}
                >
                  {category.name}
                </div>
                <p className="text-2xl font-bold mt-2">{category.count}</p>
                <p className="text-xs text-muted-foreground">articles</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
          <CardDescription>
            Manage and organize your knowledge base articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {article.excerpt}
                      </p>
                    </div>
                    <Badge className={getStatusColor(article.status)}>
                      {article.status}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span>{article.category}</span>
                    </div>
                    {article.publishDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{article.publishDate}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{article.views} views</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-3 w-3" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
