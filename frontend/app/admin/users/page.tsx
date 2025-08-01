'use client';
import React, { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { UserCard } from '@/components/UserCard';
import { UserTable } from '@/components/UserTable';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  UserPlus, 
  Shield, 
  Mail, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Settings,
  Eye,
  MoreHorizontal,
  Crown,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role: string;
  status: string;
  createdAt?: string;
  lastLoginAt?: string | null;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ROLE_CONFIG = {
  admin: { 
    label: 'Quản trị viên', 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: Crown,
    description: 'Quyền truy cập toàn hệ thống'
  },
  user: { 
    label: 'Khách hàng', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: UserCheck,
    description: 'Quyền truy cập khách hàng tiêu chuẩn'
  },
};

const STATUS_CONFIG = {
  active: { 
    label: 'Hoạt động', 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: UserCheck
  },
  inactive: { 
    label: 'Không hoạt động', 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: UserX
  },
  pending: { 
    label: 'Chờ xử lý', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: Clock
  },
};

export default function AdminUsersPage() {
  const { data, mutate, isLoading } = useSWR('/api/users', fetcher);
  const users = data?.users || [];
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);



  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Filter users in-memory
  const filteredUsers = useMemo(() => {
    return users.filter((user: AdminUser) => {
      const matchesSearch =
        !debouncedSearch ||
        user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesRole = !roleFilter || roleFilter === 'all' || (roleFilter === 'admin' ? user.isAdmin : !user.isAdmin);
      const matchesStatus = !statusFilter || statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, debouncedSearch, roleFilter, statusFilter]);

  // Calculate metrics with trends
  const metrics = useMemo(() => {
    if (!users.length) return null;
    
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentUsers = users.filter((u: AdminUser) => u.createdAt && new Date(u.createdAt) >= lastWeek);
    const lastMonthUsers = users.filter((u: AdminUser) => u.createdAt && new Date(u.createdAt) >= lastMonth);
    
    return {
      totalUsers: users.length,
      adminUsers: users.filter((u: AdminUser) => u.isAdmin).length,
      activeUsers: users.filter((u: AdminUser) => u.status === 'active').length,
      recentSignups: recentUsers.length,
      userGrowth: lastMonthUsers.length > 0 ? ((recentUsers.length - lastMonthUsers.length) / lastMonthUsers.length) * 100 : 0,
    };
  }, [users]);

  const handleRoleChange = async (id: string, isAdmin: boolean) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isAdmin }),
      });
      if (res.ok) {
        toast.success('Role updated successfully');
        mutate();
      } else {
        toast.error('Failed to update role. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to update role. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('User deleted successfully');
        mutate();
      } else {
        toast.error('Failed to delete user. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to delete user. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await mutate();
      toast.success('User list refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    toast.info('Export functionality will be implemented soon');
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatRelativeDate(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return d.toLocaleDateString('vi-VN');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* View Mode Toggle and Actions */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Bảng
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            Thẻ
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
        >
          <Download className="w-4 h-4 mr-2" />
          Xuất
        </Button>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

          {/* Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {metrics.userGrowth > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm ${metrics.userGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(metrics.userGrowth).toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-500">so với tháng trước</span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
                      <p className="text-sm text-gray-500 mt-2">Currently active</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Administrators</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.adminUsers}</p>
                      <p className="text-sm text-gray-500 mt-2">System admins</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Crown className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Recent Signups</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.recentSignups}</p>
                      <p className="text-sm text-gray-500 mt-2">Last 7 days</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <UserPlus className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6 border-l-4 border-l-gray-500">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label className="block text-xs font-medium mb-1 text-gray-700">
                    Search Users
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="min-w-[150px]">
                  <Label className="block text-xs font-medium mb-1 text-gray-700">
                    Role Filter
                  </Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Administrators</SelectItem>
                      <SelectItem value="user">Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[150px]">
                  <Label className="block text-xs font-medium mb-1 text-gray-700">
                    Status Filter
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {filteredUsers.length} users
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Display */}
          {viewMode === 'table' ? (
            <Card>
              <CardHeader>
                <CardTitle>User List</CardTitle>
                <CardDescription>
                  View and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!filteredUsers || filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchValue || roleFilter || statusFilter 
                        ? 'Try adjusting your search or filter criteria'
                        : 'No users have been registered yet'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium text-gray-700">User</th>
                          <th className="text-left p-4 font-medium text-gray-700">Email</th>
                          <th className="text-left p-4 font-medium text-gray-700">Role</th>
                          <th className="text-left p-4 font-medium text-gray-700">Status</th>
                          <th className="text-left p-4 font-medium text-gray-700">Joined</th>
                          <th className="text-right p-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user: AdminUser) => {
                          const roleConfig = ROLE_CONFIG[user.isAdmin ? 'admin' : 'user'];
                          const statusConfig = STATUS_CONFIG[user.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
                          const RoleIcon = roleConfig.icon;
                          const StatusIcon = statusConfig.icon;
                          
                          return (
                            <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm">{user.email}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge className={`${roleConfig.color} flex items-center gap-1 border`}>
                                  <RoleIcon className="w-3 h-3" />
                                  {roleConfig.label}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Badge className={`${statusConfig.color} flex items-center gap-1 border`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusConfig.label}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <span className="text-sm">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                                    <p className="text-xs text-gray-500">{user.createdAt ? formatRelativeDate(user.createdAt) : ''}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers?.map((user: AdminUser) => {
                const roleConfig = ROLE_CONFIG[user.isAdmin ? 'admin' : 'user'];
                const statusConfig = STATUS_CONFIG[user.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
                const RoleIcon = roleConfig.icon;
                const StatusIcon = statusConfig.icon;
                
                return (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-sm">{user.name}</span>
                        </div>
                        <Badge className={`${roleConfig.color} text-xs border`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{user.createdAt ? formatRelativeDate(user.createdAt) : 'N/A'}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <Badge className={`${statusConfig.color} text-xs border`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

      {/* User Details Dialog */}
      {showUserDetails && (
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">User Details</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              View complete user information and activity
            </p>
            <div className="max-h-96 overflow-y-auto">
              {selectedUser && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <p className="text-sm text-gray-900">{selectedUser.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <p className="text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Role</Label>
                      <Badge className={`${ROLE_CONFIG[selectedUser.isAdmin ? 'admin' : 'user'].color} mt-1`}>
                        {ROLE_CONFIG[selectedUser.isAdmin ? 'admin' : 'user'].label}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <Badge className={`${STATUS_CONFIG[selectedUser.status as keyof typeof STATUS_CONFIG]?.color || STATUS_CONFIG.active.color} mt-1`}>
                        {STATUS_CONFIG[selectedUser.status as keyof typeof STATUS_CONFIG]?.label || 'Active'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Joined</Label>
                      <p className="text-sm text-gray-900">{selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Last Login</Label>
                      <p className="text-sm text-gray-900">{selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Never'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
