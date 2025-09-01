"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@raypx/ui/components/alert-dialog"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@raypx/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@raypx/ui/components/dropdown-menu"
import { Input } from "@raypx/ui/components/input"
import { Label } from "@raypx/ui/components/label"
import { Textarea } from "@raypx/ui/components/textarea"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  ArrowLeft,
  Calendar,
  FileText,
  MoreHorizontal,
  Plus,
  Trash2,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  status: "active" | "inactive" | "archived"
  createdAt: string
  updatedAt: string
}

interface Document {
  id: string
  name: string
  originalName: string
  mimeType: string
  size: number
  status: "processing" | "completed" | "failed"
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// API functions
const fetchKnowledgeBase = async (
  id: string | null,
): Promise<KnowledgeBase> => {
  if (!id) {
    throw new Error("Knowledge base ID is required")
  }
  const response = await fetch(`/api/v1/knowledges/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch knowledge base")
  }
  const data = await response.json()
  return data.data
}

const fetchDocuments = async (
  knowledgeBaseId: string | null,
): Promise<Document[]> => {
  if (!knowledgeBaseId) {
    throw new Error("Knowledge base ID is required")
  }

  const response = await fetch(
    `/api/v1/knowledges/${knowledgeBaseId}/documents`,
  )
  if (!response.ok) {
    throw new Error("Failed to fetch documents")
  }
  const data = await response.json()
  return data.data
}

const uploadDocument = async (
  knowledgeBaseId: string | null,
  data: { name: string; content: string },
) => {
  if (!knowledgeBaseId) {
    throw new Error("Knowledge base ID is required")
  }

  const response = await fetch(
    `/api/v1/knowledges/${knowledgeBaseId}/documents`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  )
  if (!response.ok) {
    throw new Error("Failed to upload document")
  }
  return response.json()
}

const deleteDocument = async (
  knowledgeBaseId: string | null,
  documentId: string,
) => {
  if (!knowledgeBaseId) {
    throw new Error("Knowledge base ID is required")
  }

  const response = await fetch(
    `/api/v1/knowledges/${knowledgeBaseId}/documents/${documentId}`,
    {
      method: "DELETE",
    },
  )
  if (!response.ok) {
    throw new Error("Failed to delete document")
  }
  return response.json()
}

export default function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null)

  // Extract the id from params when component mounts
  useEffect(() => {
    params.then((resolvedParams) => {
      setKnowledgeBaseId(resolvedParams.id)
    })
  }, [params])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  )
  const [uploadForm, setUploadForm] = useState({ name: "", content: "" })

  const queryClient = useQueryClient()

  // Queries
  const { data: knowledgeBase, isLoading: isLoadingKb } = useQuery({
    queryKey: ["knowledge", knowledgeBaseId],
    queryFn: () => fetchKnowledgeBase(knowledgeBaseId),
    enabled: !!knowledgeBaseId,
  })

  const { data: documents = [], isLoading: isLoadingDocs } = useQuery({
    queryKey: ["documents", knowledgeBaseId],
    queryFn: () => fetchDocuments(knowledgeBaseId),
    enabled: !!knowledgeBaseId,
  })

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: (data: { name: string; content: string }) =>
      uploadDocument(knowledgeBaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents", knowledgeBaseId],
      })
      setIsUploadDialogOpen(false)
      setUploadForm({ name: "", content: "" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) =>
      deleteDocument(knowledgeBaseId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents", knowledgeBaseId],
      })
      setIsDeleteDialogOpen(false)
    },
  })

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadForm.name.trim() && uploadForm.content.trim()) {
      uploadMutation.mutate(uploadForm)
    }
  }

  const handleDelete = (document: Document) => {
    setSelectedDocument(document)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedDocument) {
      deleteMutation.mutate(selectedDocument.id)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  if (!knowledgeBaseId || isLoadingKb) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!knowledgeBase) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Knowledge base not found</p>
          <Link href="/dashboard/knowledge">
            <Button variant="outline" className="mt-2">
              Back to Knowledge Bases
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/knowledge">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{knowledgeBase.name}</h1>
            <p className="text-muted-foreground">
              {knowledgeBase.description || "No description"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={getStatusBadgeColor(knowledgeBase.status)}
              >
                {knowledgeBase.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Updated{" "}
                {format(new Date(knowledgeBase.updatedAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Add a new document to this knowledge base. The content will be
                automatically processed and chunked for search.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Document Name *</Label>
                <Input
                  id="name"
                  value={uploadForm.name}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, name: e.target.value })
                  }
                  placeholder="Enter document name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={uploadForm.content}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, content: e.target.value })
                  }
                  placeholder="Paste or type your document content here..."
                  rows={10}
                  className="resize-none"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Current length: {uploadForm.content.length} characters
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    uploadMutation.isPending ||
                    !uploadForm.name.trim() ||
                    !uploadForm.content.trim()
                  }
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents */}
      <div>
        <h2 className="text-lg font-medium mb-4">Documents</h2>
        {isLoadingDocs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first document to get started with this knowledge
              base.
            </p>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-1">
                        {doc.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {doc.originalName}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={getStatusBadgeColor(doc.status)}
                        >
                          {doc.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(doc)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(doc.createdAt), "MMM d, yyyy 'at' HH:mm")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDocument?.name}"? This
              action cannot be undone and will also delete all associated chunks
              and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
