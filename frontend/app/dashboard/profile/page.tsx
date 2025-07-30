/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { LoadingOrEmpty } from '@/components/ui/LoadingOrEmpty';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Edit2, User, Mail, Phone, Calendar, Shield, Save, Key } from 'lucide-react';
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { useRequireAuth } from '@/hooks/useAuth';

const profileSchema = z.object({
  name: z.string().min(2, 'Tên quá ngắn'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  phone: z.string().min(8, 'Số điện thoại quá ngắn'),
  bio: z.string().max(120, 'Tiểu sử phải ít hơn 120 ký tự').optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Bắt buộc'),
    newPassword: z.string().min(6, 'Ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}

function getPasswordStrength(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { user: authUser } = useRequireAuth('/login');
  
  // Check for localStorage authentication (admin users)
  const [localUser, setLocalUser] = useState<any>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setLocalUser(user);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);
  
  // Use backend API for admin users, frontend API for regular users
  const isAdminUser = !!localUser;
  const apiEndpoint = isAdminUser ? 'http://localhost:8080/api/users/profile' : '/api/profile';
  
  const { data: user, isLoading } = useSWR(
    (session?.user || localUser) ? apiEndpoint : null,
    async (url: string) => {
      if (isAdminUser) {
        // Use JWT token for backend API
        const token = localStorage.getItem('auth-token');
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
      } else {
        // Use regular fetcher for frontend API
        return fetcher(url);
      }
    },
    {
      fallbackData: localUser || session?.user,
    },
  );
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Profile form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    },
  });

  // Password form
  const {
    register: pwRegister,
    handleSubmit: handlePwSubmit,
    formState: { errors: pwErrors },
    reset: resetPw,
    watch: pwWatch,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });
  const newPassword = pwWatch('newPassword');
  const pwStrength = getPasswordStrength(newPassword);

  // Update profile handler
  async function onSubmitProfile(data: ProfileForm) {
    setSaving(true);
    try {
      const endpoint = isAdminUser ? 'http://localhost:8080/api/users/profile' : '/api/profile';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      if (isAdminUser) {
        const token = localStorage.getItem('auth-token');
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Update failed');
      
      // Update local state
      if (isAdminUser) {
        // Update localStorage user data
        const updatedUser = { ...localUser, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setLocalUser(updatedUser);
      } else {
        mutate('/api/profile');
      }
      
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('Đã xảy ra lỗi không xác định');
      }
    } finally {
      setSaving(false);
    }
  }

  // Change password handler
  async function onSubmitPassword(data: PasswordForm) {
    setPwSaving(true);
    try {
      if (isAdminUser) {
        // For admin users, we'll need to implement a backend endpoint for password change
        // For now, show a message that this feature is not available for admin users
        toast.error('Đổi mật khẩu chưa khả dụng cho tài khoản admin. Vui lòng liên hệ hỗ trợ.');
      } else {
        // Use frontend API for regular users
        const res = await fetch('/api/profile/password', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Password change failed');
        toast.success('Đổi mật khẩu thành công!');
        resetPw();
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('Đã xảy ra lỗi không xác định');
      }
    } finally {
      setPwSaving(false);
    }
  }

  // Reset form when user data changes
  React.useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
  }, [user, reset]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Hồ sơ cá nhân
        </h1>
        <p className="text-lg text-gray-600">
          Quản lý thông tin cá nhân và bảo mật tài khoản của bạn
        </p>
      </div>

      <LoadingOrEmpty loading={isLoading}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar
                      src={user?.image || '/images/user.jpeg'}
                      name={user?.name || undefined}
                      size={120}
                      aria-label="User avatar"
                      className="border-4 border-white shadow-lg bg-white w-30 h-30 text-5xl"
                    />
                    <button
                      className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-100 transition flex items-center"
                      title="Chỉnh sửa avatar (sắp ra mắt)"
                      type="button"
                      tabIndex={-1}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name || 'Người dùng'}</h2>
                  <p className="text-gray-600 mb-3">{user?.email}</p>
                  
                  {user?.bio && (
                    <p className="text-gray-600 text-sm mb-4 italic">"{user.bio}"</p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{user?.phone || 'Chưa cập nhật'}</span>
                    </div>
                    {user?.createdAt && (
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Tham gia: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Tài khoản đã xác thực
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#a10000]" />
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="name">
                        Họ và tên
                      </label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Nhập họ và tên"
                        disabled={saving}
                        autoComplete="name"
                        className="h-11"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="email">
                        Email
                      </label>
                      <Input
                        id="email"
                        {...register('email')}
                        placeholder="you@example.com"
                        disabled={saving}
                        autoComplete="email"
                        className="h-11"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="phone">
                      Số điện thoại
                    </label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="Nhập số điện thoại"
                      disabled={saving}
                      autoComplete="tel"
                      className="h-11"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="bio">
                      Tiểu sử / Khẩu hiệu
                    </label>
                    <Input
                      id="bio"
                      {...register('bio')}
                      placeholder="Tiểu sử ngắn hoặc khẩu hiệu (tùy chọn)"
                      disabled={saving}
                      maxLength={120}
                      className="h-11"
                    />
                    {errors.bio && (
                      <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" disabled={saving} className="w-full h-11">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#a10000]" />
                  Đổi mật khẩu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePwSubmit(onSubmitPassword)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="currentPassword">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPw ? 'text' : 'password'}
                        id="currentPassword"
                        {...pwRegister('currentPassword')}
                        placeholder="Nhập mật khẩu hiện tại"
                        disabled={pwSaving}
                        autoComplete="current-password"
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowCurrentPw((v) => !v)}
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {pwErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{pwErrors.currentPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="newPassword">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPw ? 'text' : 'password'}
                          id="newPassword"
                          {...pwRegister('newPassword')}
                          placeholder="Nhập mật khẩu mới"
                          disabled={pwSaving}
                          autoComplete="new-password"
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowNewPw((v) => !v)}
                        >
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {/* Password strength meter */}
                      {newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-2 rounded bg-gray-200 overflow-hidden">
                              <div
                                className={`h-2 rounded transition-all duration-300 ${
                                  pwStrength === 0
                                    ? 'bg-gray-200 w-0'
                                    : pwStrength === 1
                                      ? 'bg-red-400 w-1/4'
                                      : pwStrength === 2
                                        ? 'bg-yellow-400 w-2/4'
                                        : pwStrength === 3
                                          ? 'bg-blue-400 w-3/4'
                                          : 'bg-green-500 w-full'
                                }`}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {pwStrength === 0
                                ? ''
                                : pwStrength === 1
                                  ? 'Yếu'
                                  : pwStrength === 2
                                    ? 'Trung bình'
                                    : pwStrength === 3
                                      ? 'Tốt'
                                      : 'Mạnh'}
                            </span>
                          </div>
                        </div>
                      )}
                      {pwErrors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">{pwErrors.newPassword.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="confirmPassword">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPw ? 'text' : 'password'}
                          id="confirmPassword"
                          {...pwRegister('confirmPassword')}
                          placeholder="Xác nhận mật khẩu mới"
                          disabled={pwSaving}
                          autoComplete="new-password"
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPw((v) => !v)}
                        >
                          {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {pwErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{pwErrors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={pwSaving} className="w-full h-11">
                    <Key className="w-4 h-4 mr-2" />
                    {pwSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </LoadingOrEmpty>
    </div>
  );
}
