/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UnifiedAvatar } from '@/components/ui/UnifiedAvatar';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Save, 
  Key,
  CheckCircle,
  FileText,
  Camera,
  Edit3,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { UploadThingButton } from '@/components/ui/UploadThingButton';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { extractFileKeyFromUrl, isUploadThingUrl } from '@/lib/uploadthing-utils';

export default function ProfilePage() {
  const { user: authUser, isAuthenticated } = useRequireAuth('/login');
  const { user: contextUser, refreshUser } = useUser();
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  


  // Listen for avatar updates and refresh profile data
  useEffect(() => {
    const handleAvatarUpdate = () => {
      // Refresh user data to update the profile display
      refreshUser();
      // Also reload complete user data
      loadUserData();
    };

    window.addEventListener('avatar-updated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, [refreshUser]);
  const [isLoading, setIsLoading] = useState(true);
  const [completeUserData, setCompleteUserData] = useState<any>(null);





  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load complete user data from database
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      
      // Check if using NextAuth or localStorage auth
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user');
      const isAdminUser = !!(token && userData);
      
      let userResponse;
      
      if (isAdminUser) {
        // For admin users, use backend API
        const response = await fetch('http://localhost:8080/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Backend API failed: ${response.status} ${response.statusText}`);
        }
        
        userResponse = await response.json();
      } else {
        // For NextAuth users, use frontend API
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          throw new Error(`Frontend API failed: ${response.status} ${response.statusText}`);
        }
        
        userResponse = await response.json();
      }
      
      // Store complete user data for display
      setCompleteUserData(userResponse);
      
      // Debug: Log the user response
      console.log('User data loaded:', userResponse);
      
      // Update form data with complete user information
      setProfileData({
        name: userResponse.name || '',
        email: userResponse.email || '',
        phone: userResponse.phone || '',
        bio: userResponse.bio || ''
      });
      
      // Set avatar URL (trust the backend data)
      const avatarUrl = userResponse.avatar;
      if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '') {
        setAvatarUrl(avatarUrl);
      } else {
        setAvatarUrl('');
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        isAuthenticated,
        authUser: !!authUser
      });
      toast.error('Failed to load user data');
      
      // Set fallback data from auth user if available
      if (authUser) {
        const userWithAvatar = authUser as any;
        setCompleteUserData({
          id: authUser.id,
          name: authUser.name || '',
          email: authUser.email || '',
          phone: '',
          bio: '',
          avatar: userWithAvatar.avatar || '',
          createdAt: new Date().toISOString(),
        });
        
        setProfileData({
          name: authUser.name || '',
          email: authUser.email || '',
          phone: '',
          bio: ''
        });
        
        // Set avatar URL from auth user (trust the data)
        const authAvatarUrl = userWithAvatar.avatar;
        if (authAvatarUrl && typeof authAvatarUrl === 'string' && authAvatarUrl.trim() !== '') {
          setAvatarUrl(authAvatarUrl);
        } else {
          setAvatarUrl('');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authUser]);

  // Load user data on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, loadUserData]); // Run when authentication state changes



  const handleAvatarUpload = async (urls: string[]) => {
    if (urls.length > 0) {
      const newAvatarUrl = urls[0];
      setAvatarUrl(newAvatarUrl);
      
      try {
        // Save avatar URL to backend immediately
        const token = localStorage.getItem('auth-token');
        const userData = localStorage.getItem('user');
        const isAdminUser = !!(token && userData);
        
        const endpoint = isAdminUser ? 'http://localhost:8080/api/users/profile' : '/api/profile';
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        
        if (isAdminUser) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ avatar: newAvatarUrl }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to save avatar: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Update local state if admin user
        if (isAdminUser) {
          const updatedUser = { ...JSON.parse(userData), avatar: newAvatarUrl };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        // Refresh user context
        await refreshUser();
        
        // Dispatch single event to notify components of avatar update
        window.dispatchEvent(new CustomEvent('avatar-updated', { 
          detail: { avatarUrl: newAvatarUrl } 
        }));
        
        toast.success('Ảnh đã được tải lên và lưu thành công!');
        setIsAvatarDialogOpen(false);
      } catch (error) {
        console.error('❌ Error saving avatar:', error);
        toast.error('Failed to save avatar. Please try again.');
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user');
      const isAdminUser = !!(token && userData);
      
      // First, delete the file from UploadThing if it's an UploadThing URL
      if (avatarUrl && isUploadThingUrl(avatarUrl)) {
        const fileKey = extractFileKeyFromUrl(avatarUrl);
        if (fileKey) {
          try {
            const deleteResponse = await fetch('/api/uploadthing/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileKey }),
            });
            
            if (!deleteResponse.ok) {
              console.warn('Failed to delete file from UploadThing, but continuing with avatar removal');
            }
          } catch (error) {
            console.warn('Error deleting file from UploadThing:', error);
            // Continue with avatar removal even if UploadThing deletion fails
          }
        }
      }
      
      const endpoint = isAdminUser ? 'http://localhost:8080/api/users/profile' : '/api/profile';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      if (isAdminUser) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ avatar: null }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove avatar');
      }
      
      // Clear avatar URL in local state
      setAvatarUrl('');
      
      // Update local state if admin user
      if (isAdminUser) {
        const updatedUser = { ...JSON.parse(userData), avatar: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Refresh user context to get latest data
      await refreshUser();
      
      // Dispatch single event to notify components of avatar removal
      window.dispatchEvent(new CustomEvent('avatar-updated', { 
        detail: { avatarUrl: null } 
      }));
      
      toast.success('Ảnh đã được xóa thành công!');
      setIsAvatarDialogOpen(false);
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar. Please try again.');
    }
  };

  const handleDownloadAvatar = () => {
    if (avatarUrl) {
      // Open image in new tab instead of downloading
      window.open(avatarUrl, '_blank');
      toast.success('Ảnh đã được mở trong tab mới!');
    }
  };



  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Check for localStorage authentication (admin users)
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user');
      const isAdminUser = !!(token && userData);
      
      const endpoint = isAdminUser ? 'http://localhost:8080/api/users/profile' : '/api/profile';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      if (isAdminUser) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ ...profileData, avatar: avatarUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const result = await response.json();
      
      // Update local state if admin user
      if (isAdminUser) {
        const updatedUser = { ...JSON.parse(userData), ...profileData, avatar: avatarUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Update the complete user data with the result from the API
      setCompleteUserData(result);
      
      // Update localStorage for admin users
      if (isAdminUser) {
        localStorage.setItem('user', JSON.stringify(result));
      }
      
      // Dispatch avatar-updated event to refresh all avatar components
      window.dispatchEvent(new CustomEvent('avatar-updated'));
      
      toast.success('Hồ sơ đã được cập nhật thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    setPwSaving(true);
    
    try {
      const response = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }
      
      // Password change doesn't affect profile display data, so no additional API calls needed
      
      toast.success('Mật khẩu đã được thay đổi thành công!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi thay đổi mật khẩu');
    } finally {
      setPwSaving(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || ''
    };
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải...</h3>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 
          className="text-glossy text-3xl md:text-5xl font-black italic"
          style={{
            fontWeight: 900,
            fontStyle: 'italic',
            fontFamily: 'Inter, sans-serif',
            fontSize: '3.3rem',
            padding: '20px',
            color: '#a10000'
          }}
        >
          Hồ sơ cá nhân
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Quản lý thông tin cá nhân và bảo mật tài khoản của bạn
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                {/* Modern Avatar Upload Section */}
                <div className="relative mx-auto mb-3 group">
                  {/* Avatar Container with Enhanced Styling */}
                  <div className="relative inline-block">
                    <div 
                      className={`
                        relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden 
                        border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300
                        cursor-pointer group-hover:scale-105 group-hover:border-gray-200
                        ${avatarUrl ? 'ring-2 ring-blue-100' : 'ring-2 ring-gray-200'}
                      `}
                      onClick={() => setIsAvatarDialogOpen(true)}
                      role="button"
                      tabIndex={0}
                      aria-label="Click to change profile picture"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsAvatarDialogOpen(true);
                        }
                      }}
                    >
                      {/* Unified Avatar Component */}
                      <div className="w-full h-full">
                        {!isLoading && completeUserData ? (
                          <UnifiedAvatar
                            user={completeUserData}
                            size={128}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gray-200 animate-pulse" />
                        )}
                      </div>
                      
                      {/* Best Practice Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center scale-120">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                          <Camera className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Upload Status Indicator - Only show if custom avatar is set */}
                    {avatarUrl && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    {/* Quick Upload Button */}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      onClick={() => setIsAvatarDialogOpen(true)}
                      aria-label="Edit profile picture"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Upload Hint */}
                  <p className="text-xs text-gray-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Nhấp để thay đổi ảnh
                  </p>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{profileData.name}</h3>
                <p className="text-gray-600 mb-2">{profileData.email}</p>
                {profileData.bio && (
                  <p className="text-sm text-gray-500 mb-4 italic">"{profileData.bio}"</p>
                )}
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Tài khoản đã xác thực
                </Badge>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{completeUserData?.email || authUser?.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Số điện thoại</p>
                    <p className="text-sm text-gray-600">
                      {completeUserData?.phone ? completeUserData.phone : 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tiểu sử</p>
                    <p className="text-sm text-gray-600">
                      {completeUserData?.bio ? completeUserData.bio : 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ngày tham gia</p>
                    <p className="text-sm text-gray-600">
                      {completeUserData?.createdAt ? 
                        new Date(completeUserData.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 
                        'Không xác định'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Form */}
          <Card>
            <CardHeader className="pt-6">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#a10000]" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="mb-2">Họ và tên</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Nhập họ và tên"
                      className="h-11"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="mb-2">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="Nhập email"
                      className="h-11"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone" className="mb-2">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    className="h-11"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio" className="mb-2">Tiểu sử / Khẩu hiệu</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Viết một chút về bản thân hoặc khẩu hiệu của bạn (tùy chọn)"
                    className="min-h-[100px] resize-none"
                    maxLength={120}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profileData.bio.length}/120 ký tự
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full h-11 bg-[#a10000] hover:bg-red-800"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Form */}
          <Card>
            <CardHeader className="pt-6">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#a10000]" />
                Thay đổi mật khẩu
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="mb-2">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="h-11"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="newPassword" className="mb-2">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Nhập mật khẩu mới"
                    className="h-11"
                    required
                  />
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((level) => {
                          const strength = getPasswordStrength(passwordData.newPassword);
                          return (
                            <div
                              key={level}
                              className={`h-2 flex-1 rounded ${
                                level <= strength.strength ? strength.color : 'bg-gray-200'
                              }`}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-600">
                        Độ mạnh: {getPasswordStrength(passwordData.newPassword).label}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="mb-2">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    className="h-11"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={pwSaving} 
                  className="w-full h-11 bg-[#a10000] hover:bg-red-800"
                >
                  <Key className="w-4 h-4 mr-2" />
                  {pwSaving ? 'Đang thay đổi...' : 'Thay đổi mật khẩu'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avatar Upload Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <h2 className="text-xl font-semibold flex items-center gap-3 text-gray-900" id="dialog-title">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
              Ảnh đại diện
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tải lên ảnh đại diện mới hoặc quản lý ảnh hiện tại
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current Avatar Preview */}
            {avatarUrl && avatarUrl.trim() !== '' && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Ảnh hiện tại
                </h4>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt="Ảnh đại diện hiện tại"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border border-white"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      Ảnh đại diện hiện tại của bạn đang hoạt động
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadAvatar}
                        className="flex items-center gap-2 text-xs"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Xem ảnh
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upload New Avatar */}
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">
                  {avatarUrl && avatarUrl.trim() !== '' ? 'Tải lên ảnh mới' : 'Tải lên ảnh đại diện'}
                </h4>
                <p className="text-sm text-gray-500">
                  Chọn ảnh rõ nét, chất lượng cao. Khuyến nghị: 400x400 pixel, dưới 2MB.
                </p>
              </div>
              
              {/* Enhanced Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Camera className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Nhấp để tải lên hoặc kéo thả
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP tối đa 2MB
                    </p>
                  </div>
                  <UploadThingButton
                    endpoint="avatarUploader"
                    onUploadComplete={handleAvatarUpload}
                    maxFiles={1}
                    maxSize={2}
                    showPreview={false}
                    className="inline-flex"
                  />
                </div>
              </div>
            </div>
            
            {/* Enhanced Tips Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <h5 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Mẹo cho ảnh đại diện đẹp
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Sử dụng ảnh rõ nét, ánh sáng tốt</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Khuôn mặt phải rõ ràng</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Định dạng vuông phù hợp nhất</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Kích thước file dưới 2MB</span>
                </div>
              </div>
            </div>
            

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
