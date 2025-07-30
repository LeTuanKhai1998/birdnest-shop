/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Save, 
  Key,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useRequireAuth('/login');
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

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

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any)?.phone || '',
        bio: (user as any)?.bio || ''
      });
    }
  }, [user]);

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
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const result = await response.json();
      
      // Update local state if admin user
      if (isAdminUser) {
        const updatedUser = { ...JSON.parse(userData), ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
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
      // Check for localStorage authentication (admin users)
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user');
      const isAdminUser = !!(token && userData);
      
      if (isAdminUser) {
        // For admin users, show a message that password change is not available
        toast.error('Đổi mật khẩu chưa khả dụng cho tài khoản admin. Vui lòng liên hệ hỗ trợ.');
        return;
      }
      
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

  if (!user) {
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
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-[#a10000]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{user.name}</h3>
                <p className="text-gray-600 mb-4">{user.email}</p>
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
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Số điện thoại</p>
                    <p className="text-sm text-gray-600">{(user as any)?.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tiểu sử</p>
                    <p className="text-sm text-gray-600">{(user as any)?.bio || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ngày tham gia</p>
                    <p className="text-sm text-gray-600">
                      {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString('vi-VN') : 'Không xác định'}
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#a10000]" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#a10000]" />
                Thay đổi mật khẩu
              </CardTitle>
            </CardHeader>
            <CardContent>
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
    </div>
  );
}
