'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Trash2, 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Users,
  User as UserIcon,
  Edit,
  Mail,
  Crown,
  X,
  Save,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  UserX,
  Calendar,
  Shield,
  Eye
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

import useSWR, { mutate as globalMutate } from 'swr';
import { apiService } from '@/lib/api';
import type { User } from '@/lib/types';

import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';
import { UnifiedAvatar } from '@/components/ui/UnifiedAvatar';

const userSchema = z.object({
  name: z.string().min(2, 'Tên người dùng là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
  isAdmin: z.boolean().optional(),
});

type UserForm = z.infer<typeof userSchema>;



// Role configuration
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



export default function AdminUsersPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cacheKey, setCacheKey] = useState<string>(`admin-users-${Date.now()}`);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const userDetailsModalRef = useRef<HTMLDivElement | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState<'name' | 'email' | 'createdAt' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  const { data: users, isLoading, mutate } = useSWR(cacheKey, () => apiService.getUsers(), {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });



  // Handle sorting
  const handleSort = (field: 'name' | 'email' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: 'name' | 'email' | 'createdAt') => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    let filtered = users.filter((user: User) => {
      const matchesSearch = !searchValue || 
        (user.name && user.name.toLowerCase().includes(searchValue.toLowerCase())) ||
        user.email.toLowerCase().includes(searchValue.toLowerCase());
      const matchesRole = !roleFilter || 
        (roleFilter === 'admin' ? user.isAdmin : !user.isAdmin);
      return matchesSearch && matchesRole;
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a: User, b: User) => {
        let aValue: string, bValue: string;
        
        if (sortField === 'name') {
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
        } else if (sortField === 'email') {
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
        } else {
          aValue = a.createdAt ? new Date(a.createdAt).toISOString() : '';
          bValue = b.createdAt ? new Date(b.createdAt).toISOString() : '';
        }

        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    return filtered;
  }, [users, searchValue, roleFilter, sortField, sortDirection]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, roleFilter]);

  // Handle clicks outside modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside user form modal
      if (dialogOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setDialogOpen(false);
      }
      
      // Check if click is outside user details modal
      if (showUserDetails && userDetailsModalRef.current && !userDetailsModalRef.current.contains(event.target as Node)) {
        setShowUserDetails(false);
      }
    };

    if (dialogOpen || showUserDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dialogOpen, showUserDetails]);

  // Pagination logic
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const totalItems = filteredUsers.length;

  // Calculate metrics from real API data
  const metrics = useMemo(() => {
    if (!users) return null;
    
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentUsers = users.filter((u: User) => u.createdAt && new Date(u.createdAt) >= lastWeek);
    const lastMonthUsers = users.filter((u: User) => u.createdAt && new Date(u.createdAt) >= lastMonth);
    
    return {
      totalUsers: users.length,
      adminUsers: users.filter((u: User) => u.isAdmin).length,
      activeUsers: users.length, // All users are considered active for now
      recentSignups: recentUsers.length,
      userGrowth: lastMonthUsers.length > 0 ? ((recentUsers.length - lastMonthUsers.length) / lastMonthUsers.length) * 100 : 0,
    };
  }, [users]);

  const onSubmit = async (data: UserForm) => {
    try {
      setLoading(true);
      
      if (editId) {
        await apiService.updateUser(editId, {
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
        });
        toast({
          title: "Người dùng đã cập nhật",
          description: "Thông tin người dùng đã được cập nhật thành công",
          variant: "success",
        });
      } else {
        await apiService.createUser({
          name: data.name,
          email: data.email,
          password: data.password || 'changeme123', // Default password if not provided
          isAdmin: data.isAdmin,
        });
        toast({
          title: "Người dùng đã tạo",
          description: "Người dùng mới đã được tạo thành công",
          variant: "success",
        });
      }
      
      await mutate();
      setDialogOpen(false);
      setEditId(null);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu người dùng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (user: User) => {
    setEditId(user.id);
    setDialogOpen(true);
    
    // Populate form with user data
    setValue('name', user.name || '');
    setValue('email', user.email);
    setValue('isAdmin', user.isAdmin);
    // Don't populate password for security reasons
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setDialogOpen(false);
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteId(userId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      await apiService.deleteUser(deleteId);
      await mutate(undefined, { revalidate: true });
      toast({
        title: "Người dùng đã xóa",
        description: "Người dùng đã được xóa thành công",
        variant: "success",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear all SWR cache and force revalidation
      await globalMutate(() => true, undefined, { revalidate: true });
      
      // Also clear specific keys
      await Promise.all([
        mutate(undefined, { revalidate: true }),
      ]);
      
      // Force a small delay to ensure cache is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update cache keys to force fresh data fetch
      setCacheKey(`admin-users-${Date.now()}`);
      
    } catch (error) {
      // Error handling for refresh operation
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewUser = (user: User) => {
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
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 48) return 'Hôm qua';
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
    <div className="space-y-8">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="hover:shadow-lg transition-shadow duration-200 flex-1 sm:flex-none"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
            <span className="sm:hidden">Làm mới</span>
          </Button>
        </div>

        <Button 
          onClick={() => setDialogOpen(true)}
          className="bg-[#a10000] hover:bg-red-800 hover:shadow-lg transition-all duration-200 order-1 sm:order-2 flex-1 sm:flex-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Thêm người dùng</span>
          <span className="sm:hidden">Thêm người dùng</span>
        </Button>
      </div>

      {/* Stats Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {metrics.userGrowth > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm ${metrics.userGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(metrics.userGrowth).toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500">so với tháng trước</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-purple-50">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Người dùng hoạt động</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quản trị viên</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.adminUsers}</p>
                </div>
                <div className="p-3 rounded-full bg-orange-50">
                  <Crown className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đăng ký gần đây</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.recentSignups}</p>
                  <p className="text-sm text-gray-500">7 ngày qua</p>
                </div>
                <div className="p-3 rounded-full bg-green-50">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Section */}
      <div>
        <h2 
          className="text-2xl font-bold text-[#a10000] mb-6"
        >
          Tìm kiếm và lọc
        </h2>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên</option>
                  <option value="user">Khách hàng</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table Section */}
      <div>
        <h2 
          className="text-2xl font-bold text-[#a10000] mb-6"
        >
          Danh sách người dùng
        </h2>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có người dùng</h3>
              <p className="text-gray-600 mb-4">Bắt đầu bằng cách thêm người dùng đầu tiên.</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm người dùng
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-4 font-medium text-gray-700">Người dùng</th>
                    <th className="hidden sm:table-cell text-left p-2 sm:p-4 font-medium text-gray-700">Email</th>
                    <th className="hidden md:table-cell text-left p-2 sm:p-4 font-medium text-gray-700">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                      >
                        Ngày tham gia
                        {getSortIcon('createdAt')}
                      </button>
                    </th>
                    <th className="hidden sm:table-cell text-left p-2 sm:p-4 font-medium text-gray-700">Vai trò</th>
                    <th className="text-right p-2 sm:p-4 font-medium text-gray-700 whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user: User) => {
                    const roleConfig = ROLE_CONFIG[user.isAdmin ? 'admin' : 'user'];
                    const RoleIcon = roleConfig.icon;
                    
                    return (
                      <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-2 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <UnifiedAvatar
                                user={{ name: user.name || 'User', email: user.email }}
                                size={40}
                                className="rounded-lg"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{user.name || 'Không có tên'}</p>
                              <p className="text-xs text-gray-500 truncate hidden sm:block">
                                {user.email}
                              </p>
                              <div className="flex items-center gap-2 sm:hidden mt-1">
                                <Badge 
                                  variant="secondary" 
                                  className={cn(
                                    "text-xs border",
                                    roleConfig.color
                                  )}
                                >
                                  <RoleIcon className="w-3 h-3 mr-1" />
                                  {roleConfig.label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell p-2 sm:p-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell p-2 sm:p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <span className="text-sm">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                              <p className="text-xs text-gray-500">{user.createdAt ? formatRelativeDate(user.createdAt) : ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell p-2 sm:p-4">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs border",
                              roleConfig.color
                            )}
                          >
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleConfig.label}
                          </Badge>
                        </td>
                        <td className="p-2 sm:p-4 text-right">
                          <div className="flex items-center gap-1 sm:gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUser(user)}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Enhanced Pagination Controls - Inside Card */}
          {totalItems > 0 && (
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Hiển thị <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> - <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> trong tổng số <span className="font-medium">{totalItems}</span> người dùng
                  </span>
                  
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Hiển thị:</span>
                    <select 
                      value={pageSize} 
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-16 h-8 text-sm border border-gray-300 rounded px-2"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                
                {/* Enhanced Pagination Navigation */}
                <div className="flex items-center gap-1">
                  {/* First Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                    title="Trang đầu"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  
                  {/* Previous Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {/* Page Numbers with Ellipsis */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      
                      if (totalPages <= maxVisible) {
                        // Show all pages if total is small
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={currentPage === i ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(i)}
                              className="h-8 w-8 p-0 text-sm font-medium"
                            >
                              {i}
                            </Button>
                          );
                        }
                      } else {
                        // Show smart pagination with ellipsis
                        if (currentPage <= 3) {
                          // Near start
                          for (let i = 1; i <= 4; i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={currentPage === i ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(i)}
                                className="h-8 w-8 p-0 text-sm font-medium"
                              >
                                {i}
                              </Button>
                            );
                          }
                          pages.push(
                            <span key="ellipsis1" className="px-2 text-gray-400">...</span>
                          );
                          pages.push(
                            <Button
                              key={totalPages}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              className="h-8 w-8 p-0 text-sm font-medium"
                            >
                              {totalPages}
                            </Button>
                          );
                        } else if (currentPage >= totalPages - 2) {
                          // Near end
                          pages.push(
                            <Button
                              key={1}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              className="h-8 w-8 p-0 text-sm font-medium"
                            >
                              1
                            </Button>
                          );
                          pages.push(
                            <span key="ellipsis2" className="px-2 text-gray-400">...</span>
                          );
                          for (let i = totalPages - 3; i <= totalPages; i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={currentPage === i ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(i)}
                                className="h-8 w-8 p-0 text-sm font-medium"
                              >
                                {i}
                              </Button>
                            );
                          }
                        } else {
                          // Middle
                          pages.push(
                            <Button
                              key={1}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              className="h-8 w-8 p-0 text-sm font-medium"
                            >
                              1
                            </Button>
                          );
                          pages.push(
                            <span key="ellipsis3" className="px-2 text-gray-400">...</span>
                          );
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={currentPage === i ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(i)}
                                className="h-8 w-8 p-0 text-sm font-medium"
                              >
                                {i}
                              </Button>
                            );
                          }
                          pages.push(
                            <span key="ellipsis4" className="px-2 text-gray-400">...</span>
                          );
                          pages.push(
                            <Button
                              key={totalPages}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              className="h-8 w-8 p-0 text-sm font-medium"
                            >
                              {totalPages}
                            </Button>
                          );
                        }
                      }
                      
                      return pages;
                    })()}
                  </div>
                  
                  {/* Next Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                    title="Trang tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  {/* Last Page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                    title="Trang cuối"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      {/* User Form Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {editId ? (
                      <Edit className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      {editId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                    </h2>
                    <p className="text-white font-medium">
                      {editId ? 'Cập nhật thông tin người dùng hiện có' : 'Thêm người dùng mới vào hệ thống'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Header with status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#a10000] rounded-lg">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#a10000]">
                        {editId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {editId ? 'Cập nhật thông tin người dùng hiện có' : 'Thêm người dùng mới vào hệ thống'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-[#a10000]">
                          Thông tin cơ bản
                          <Badge variant="secondary" className="text-xs">Bắt buộc</Badge>
                        </CardTitle>
                        <CardDescription>
                          Thông tin cá nhân và thông tin đăng nhập của người dùng
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          Tên người dùng
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="Nhập tên người dùng"
                          className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          Email
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="Nhập email"
                          className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Password - Only show when creating new user */}
                    {!editId && (
                      <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2">
                          Mật khẩu
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          {...register('password')}
                          placeholder="Nhập mật khẩu"
                          className={errors.password ? 'border-red-300 focus:border-red-500' : ''}
                        />
                        {errors.password && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.password.message}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Permissions and Status */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-[#a10000]">
                          Quyền hạn và trạng thái
                          <Badge variant="secondary" className="text-xs">Tùy chọn</Badge>
                        </CardTitle>
                        <CardDescription>
                          Cấu hình quyền truy cập và trạng thái hoạt động của người dùng
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    {/* Admin Status */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register('isAdmin')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">Quyền quản trị viên</span>
                      </Label>
                      <p className="text-xs text-gray-500 ml-6">
                        Người dùng có quyền truy cập vào tất cả tính năng quản trị và cài đặt hệ thống
                      </p>
                      {errors.isAdmin && (
                        <p className="text-sm text-red-600 flex items-center gap-1 ml-6">
                          <AlertCircle className="w-3 h-3" />
                          {errors.isAdmin.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editId ? 'Cập nhật người dùng' : 'Thêm người dùng'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Xóa người dùng</h2>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelDelete}>
                Hủy
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Dialog */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div ref={userDetailsModalRef} className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Chi tiết người dùng</h2>
                    <p className="text-white font-medium">
                      Xem thông tin chi tiết và hoạt động của người dùng
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Header with status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#a10000] rounded-lg">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#a10000]">
                        Thông tin người dùng
                      </h2>
                      <p className="text-sm text-gray-600">
                        Chi tiết thông tin cá nhân và quyền hạn của người dùng
                      </p>
                    </div>
                  </div>
                  <Badge className={`${ROLE_CONFIG[selectedUser.isAdmin ? 'admin' : 'user'].color} text-sm font-medium`}>
                    {ROLE_CONFIG[selectedUser.isAdmin ? 'admin' : 'user'].label}
                  </Badge>
                </div>

                {/* Basic Information */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-[#a10000]">
                          Thông tin cơ bản
                          <Badge variant="secondary" className="text-xs">Thông tin</Badge>
                        </CardTitle>
                        <CardDescription>
                          Thông tin cá nhân và thông tin đăng nhập của người dùng
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          Tên người dùng
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedUser.name || 'Không có tên'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedUser.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Status and Permissions */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-[#a10000]">
                          Trạng thái và quyền hạn
                          <Badge variant="secondary" className="text-xs">Hệ thống</Badge>
                        </CardTitle>
                        <CardDescription>
                          Thông tin về quyền truy cập và trạng thái hoạt động
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          Vai trò
                        </Label>
                        <div className="flex items-center gap-2">
                          <Badge className={`${ROLE_CONFIG[selectedUser.isAdmin ? 'admin' : 'user'].color} text-sm font-medium`}>
                            {ROLE_CONFIG[selectedUser.isAdmin ? 'admin' : 'user'].label}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {selectedUser.isAdmin ? 'Quyền truy cập toàn hệ thống' : 'Quyền truy cập khách hàng tiêu chuẩn'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          Ngày tham gia
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'N/A'}
                          </p>
                          {selectedUser.createdAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatRelativeDate(selectedUser.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        Trạng thái tài khoản
                      </Label>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-900 font-medium">Hoạt động</span>
                        <span className="text-xs text-gray-500">Tài khoản đang hoạt động bình thường</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Statistics */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-[#a10000]">
                          Thống kê hoạt động
                          <Badge variant="secondary" className="text-xs">Tùy chọn</Badge>
                        </CardTitle>
                        <CardDescription>
                          Thông tin về hoạt động và tương tác của người dùng
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <div className="text-sm text-gray-600">Đơn hàng</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-sm text-gray-600">Đánh giá</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-gray-600">Sản phẩm yêu thích</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
