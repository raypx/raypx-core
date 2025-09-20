"use client";

import { admin } from "@raypx/auth/client";
import { useAuth } from "@raypx/auth/core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@raypx/ui/components/alert-dialog";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@raypx/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@raypx/ui/components/dropdown-menu";
import { Input } from "@raypx/ui/components/input";
import { Label } from "@raypx/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@raypx/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@raypx/ui/components/table";
import { Textarea } from "@raypx/ui/components/textarea";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  LogOut,
  MoreHorizontal,
  Search,
  Shield,
  UserCheck,
  User as UserIcon,
  Users,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  username?: string;
  role?: "user" | "moderator" | "admin" | "superadmin";
  banned: boolean;
  banReason?: string;
  banExpires?: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
}

type UserRole = "user" | "moderator" | "admin" | "superadmin";
type UserStatus = "all" | "active" | "banned";
type FilterState = "all" | UserRole;

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  recentUsers: number;
}

interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    offset: number;
  };
}

// API functions
const fetchUsers = async (params: {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  role?: string;
  status?: string;
}): Promise<UsersResponse> => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.set(key, value.toString());
    }
  });

  const response = await fetch(`/api/v1/users?${query}`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
};

const fetchUserStats = async (): Promise<{ data: UserStats }> => {
  const response = await fetch("/api/v1/users/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch user stats");
  }
  return response.json();
};

const banUser = async (
  id: string,
  data: {
    banReason: string;
    banExpires?: string;
  },
) => {
  const response = await fetch(`/api/v1/users/${id}/ban`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to ban user");
  }
  return response.json();
};

const unbanUser = async (id: string) => {
  const response = await fetch(`/api/v1/users/${id}/unban`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to unban user");
  }
  return response.json();
};

const changeUserRole = async (id: string, role: string) => {
  const response = await fetch(`/api/v1/users/${id}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    throw new Error("Failed to change user role");
  }
  return response.json();
};

const startImpersonation = async (targetUserId: string) => {
  const response = await admin.impersonateUser({
    userId: targetUserId,
  });
  if (!response.data) {
    throw new Error("Failed to start impersonation");
  }
  return response;
};

const endImpersonation = async () => {
  const response = await admin.stopImpersonating();
  if (!response.data) {
    throw new Error("Failed to end impersonation");
  }
  return response;
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<UserStatus>("all");
  const [roleFilter, setRoleFilter] = useState<FilterState>("all");
  const router = useRouter();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, roleFilter]);

  const {
    hooks: { useSession },
  } = useAuth();

  const { data: session, refetch } = useSession();

  // Dialog states
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isImpersonateDialogOpen, setIsImpersonateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [banForm, setBanForm] = useState({ reason: "", expires: "" });
  const [newRole, setNewRole] = useState("");

  const queryClient = useQueryClient();
  const limit = 15;

  // Queries with proper typing
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: fetchUserStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Remove active impersonations query since better-auth handles this internally

  const queryParams = useMemo(
    () => ({
      limit,
      offset: (currentPage - 1) * limit,
      search: debouncedSearch || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      role: roleFilter === "all" ? undefined : roleFilter,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    }),
    [currentPage, limit, debouncedSearch, statusFilter, roleFilter],
  );

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => fetchUsers(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutations
  const banMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { banReason: string; banExpires?: string } }) =>
      banUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      setIsBanDialogOpen(false);
      setBanForm({ reason: "", expires: "" });
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error("Failed to ban user:", error);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: unbanUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      setIsUnbanDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error("Failed to unban user:", error);
    },
  });

  const roleChangeMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => changeUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsRoleDialogOpen(false);
      setNewRole("");
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error("Failed to change user role:", error);
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) => startImpersonation(userId),
    onSuccess: () => {
      setIsImpersonateDialogOpen(false);
      setSelectedUser(null);
      // Refresh the page to switch to impersonated user
      router.replace("/");
      refetch();
    },
    onError: (error) => {
      console.error("Failed to start impersonation:", error);
    },
  });

  const endImpersonationMutation = useMutation({
    mutationFn: endImpersonation,
    onSuccess: () => {
      // Refresh the page to return to admin user
      router.replace("/");
      refetch();
    },
    onError: (error) => {
      console.error("Failed to end impersonation:", error);
    },
  });

  const handleBan = useCallback((user: User) => {
    setSelectedUser(user);
    setBanForm({ reason: "", expires: "" }); // Reset form
    setIsBanDialogOpen(true);
  }, []);

  const handleUnban = useCallback((user: User) => {
    setSelectedUser(user);
    setIsUnbanDialogOpen(true);
  }, []);

  const handleRoleChange = useCallback((user: User) => {
    setSelectedUser(user);
    setNewRole(user.role || "");
    setIsRoleDialogOpen(true);
  }, []);

  const handleImpersonate = useCallback((user: User) => {
    setSelectedUser(user);
    setIsImpersonateDialogOpen(true);
  }, []);

  const handleEndImpersonation = () => {
    endImpersonationMutation.mutate();
    router.replace("/");
    refetch();
  };

  const confirmBan = useCallback(() => {
    if (selectedUser && banForm.reason.trim()) {
      banMutation.mutate({
        id: selectedUser.id,
        data: {
          banReason: banForm.reason.trim(),
          banExpires: banForm.expires || undefined,
        },
      });
    }
  }, [selectedUser, banForm, banMutation]);

  const confirmUnban = useCallback(() => {
    if (selectedUser) {
      unbanMutation.mutate(selectedUser.id);
    }
  }, [selectedUser, unbanMutation]);

  const confirmRoleChange = useCallback(() => {
    if (selectedUser && newRole && newRole !== selectedUser.role) {
      roleChangeMutation.mutate({
        id: selectedUser.id,
        role: newRole as UserRole,
      });
    }
  }, [selectedUser, newRole, roleChangeMutation]);

  const confirmImpersonate = useCallback(() => {
    if (selectedUser) {
      impersonateMutation.mutate({
        userId: selectedUser.id,
      });
    }
  }, [selectedUser, impersonateMutation]);

  const getRoleBadgeColor = useCallback((role?: UserRole) => {
    switch (role) {
      case "admin":
      case "superadmin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  // Enhanced error handling
  if (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and access permissions</p>
        </div>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Users</h3>
                  <p className="text-red-700 text-sm max-w-md mx-auto mb-4">{errorMessage}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                  <Button
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ["users"] });
                      queryClient.invalidateQueries({
                        queryKey: ["user-stats"],
                      });
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stats component with loading state
  const renderStatsSection = (): any => {
    if (isStatsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!statsData?.data) return null;

    const stats = [
      {
        title: "Total Users",
        value: statsData.data.totalUsers,
        icon: Users,
        color: "text-muted-foreground",
        valueColor: "text-gray-900",
      },
      {
        title: "Active Users",
        value: statsData.data.activeUsers,
        icon: UserCheck,
        color: "text-green-600",
        valueColor: "text-green-600",
      },
      {
        title: "Banned Users",
        value: statsData.data.bannedUsers,
        icon: UserX,
        color: "text-red-600",
        valueColor: "text-red-600",
      },
      {
        title: "New Users (30d)",
        value: statsData.data.recentUsers,
        icon: Users,
        color: "text-blue-600",
        valueColor: "text-blue-600",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.valueColor}`}>
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-muted-foreground">Manage users, roles, and access permissions</p>
      </div>

      {renderStatsSection()}

      {/* Impersonation Status */}
      {session?.user && (session as Record<string, unknown>).impersonatedBy && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <Users className="w-5 h-5" />
              <span>Currently Impersonating</span>
            </CardTitle>
            <CardDescription>
              You are viewing the system as {session.user.name} ({session.user.email})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="font-medium">{session.user.name}</div>
                  <div className="text-sm text-gray-500">{session.user.email}</div>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  Impersonating
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndImpersonation}
                disabled={endImpersonationMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Stop Impersonating
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search !== debouncedSearch && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as UserStatus)}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as FilterState)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="superadmin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {data?.meta.total || 0} users total
            {isFetching && !isLoading && <span className="ml-2 text-blue-600">• Updating...</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse border rounded p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/6" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16" />
                    <div className="h-6 bg-gray-200 rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {debouncedSearch || statusFilter !== "all" || roleFilter !== "all"
                  ? "No users match your current filters. Try adjusting your search criteria."
                  : "No users have been created yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            {user.username && (
                              <div className="text-sm text-muted-foreground">@{user.username}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{user.email}</span>
                          {user.emailVerified ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.banned ? (
                          <div>
                            <Badge variant="destructive">Banned</Badge>
                            {user.banExpires && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Until {format(new Date(user.banExpires), "MMM d, yyyy")}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRoleChange(user)}>
                              <Shield className="w-4 h-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            {!user.banned &&
                              user.role !== "admin" &&
                              user.role !== "superadmin" && (
                                <DropdownMenuItem onClick={() => handleImpersonate(user)}>
                                  <Users className="w-4 h-4 mr-2" />
                                  Impersonate
                                </DropdownMenuItem>
                              )}
                            {user.banned ? (
                              <DropdownMenuItem
                                onClick={() => handleUnban(user)}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleBan(user)}
                                className="text-red-600"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(data.meta.totalPages, currentPage + 1))}
                disabled={currentPage === data.meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban "{selectedUser?.name}" from the platform. This will prevent them from accessing
              their account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ban-reason">Ban Reason *</Label>
              <Textarea
                id="ban-reason"
                value={banForm.reason}
                onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                placeholder="Enter reason for ban..."
                required
              />
            </div>
            <div>
              <Label htmlFor="ban-expires">Ban Expires (optional)</Label>
              <Input
                id="ban-expires"
                type="datetime-local"
                value={banForm.expires}
                onChange={(e) => setBanForm({ ...banForm, expires: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBan}
              disabled={banMutation.isPending || !banForm.reason.trim()}
            >
              {banMutation.isPending ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban User Dialog */}
      <AlertDialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban "{selectedUser?.name}"? They will regain access to
              their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnban} disabled={unbanMutation.isPending}>
              {unbanMutation.isPending ? "Unbanning..." : "Unban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for "{selectedUser?.name}". This will affect their permissions on the
              platform.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="new-role">New Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRoleChange} disabled={roleChangeMutation.isPending || !newRole}>
              {roleChangeMutation.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impersonate User Dialog */}
      <Dialog open={isImpersonateDialogOpen} onOpenChange={setIsImpersonateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonate User</DialogTitle>
            <DialogDescription>
              Temporarily sign in as "{selectedUser?.name}" for support purposes. You will be
              switched to their account in this session.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium">Important Security Notice</div>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Use impersonation only for legitimate support purposes</li>
                  <li>• All actions will be logged and audited</li>
                  <li>• End the session as soon as possible</li>
                  <li>• Never access sensitive personal information unnecessarily</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImpersonateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmImpersonate}
              disabled={impersonateMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {impersonateMutation.isPending ? "Starting..." : "Start Impersonation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
