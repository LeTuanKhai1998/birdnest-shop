'use client';
import { Suspense, useEffect } from 'react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Loader2, Lock, AlertCircle, CheckCircle, User } from 'lucide-react';
import Footer from '@/components/Footer';

function SignupPageInner() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is already authenticated
  useEffect(() => {
    // Check for NextAuth session
    if (status === 'authenticated' && session?.user) {
      const user = session.user as { id: string; email: string; name?: string; isAdmin: boolean };
      // Redirect to appropriate dashboard based on user type
      const defaultDestination = user.isAdmin ? '/admin' : '/dashboard';
      router.push(defaultDestination);
      return;
    }

    // Check for localStorage auth (admin users)
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        // Redirect to appropriate dashboard based on user type
        const defaultDestination = user.isAdmin ? '/admin' : '/dashboard';
        router.push(defaultDestination);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
      }
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a10000] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Don't render signup form if user is authenticated
  if (status === 'authenticated' || localStorage.getItem('auth-token')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a10000] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Đăng ký thất bại');
      toast.error(data.error || 'Đăng ký thất bại');
      return;
    }
    toast.success('Tài khoản đã được tạo! Vui lòng đăng nhập.');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white">
      {/* Hero Section */}
      <section
        className="relative w-full bg-[#a10000] overflow-hidden lg:bg-[#a10000] bg-gradient-to-b from-[#a10000] to-[#fbd8b0]"
        style={{ minHeight: '400px' }}
      >
        {/* Background Image - Desktop */}
        <Image
          src="/images/bg_banner_top.jpg"
          alt="Banner Background"
          fill
          className="object-cover w-full h-full hidden lg:block"
          priority
          quality={100}
          sizes="100vw"
          style={{ zIndex: 0, objectPosition: 'center 30%' }}
        />

        {/* Background Image - Mobile */}
        <Image
          src="/images/bg_banner_top_mobile.jpg"
          alt="Banner Background Mobile"
          fill
          className="object-cover w-full h-full lg:hidden"
          priority
          quality={100}
          sizes="100vw"
          style={{ zIndex: 0, objectPosition: 'center top' }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Đăng Ký
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Tạo tài khoản mới để bắt đầu mua sắm
            </p>
          </div>
        </div>
      </section>

      {/* Signup Form Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-[#a10000]">
                <User className="w-6 h-6" />
                Tạo Tài Khoản Mới
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Điền thông tin để tạo tài khoản của bạn
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Họ và tên
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Nhập họ và tên của bạn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Nhập địa chỉ email của bạn"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mật khẩu *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Nhập mật khẩu của bạn"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="h-12 text-base pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Xác nhận mật khẩu *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Nhập lại mật khẩu của bạn"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="h-12 text-base pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium text-sm">{error}</span>
                    </div>
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-[#a10000] hover:bg-red-800 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Đang đăng ký...
                    </>
                  ) : (
                    'Đăng Ký'
                  )}
                </Button>
              </form>
              
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="mx-4 text-gray-400 text-sm font-medium">hoặc</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    // Handle Google signup if needed
                    toast.info('Tính năng đăng ký với Google sẽ được cập nhật sớm');
                  }}
                  disabled={loading}
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">Đăng ký với Google</span>
                </Button>
              </div>
              
              <div className="text-center pt-4 pb-8">
                <p className="text-sm text-gray-600">
                  Đã có tài khoản?{' '}
                  <a 
                    href="/login" 
                    className="text-[#a10000] hover:text-red-800 font-medium hover:underline transition-colors"
                  >
                    Đăng nhập ngay
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#a10000]">
              Lợi Ích Khi Đăng Ký
            </h2>
            <p className="text-lg text-gray-600">
              Tận hưởng những ưu đãi đặc biệt dành cho thành viên
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#a10000]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#a10000]">Ưu Đãi Đặc Biệt</h3>
                <p className="text-gray-600">
                  Nhận thông báo về các chương trình khuyến mãi và ưu đãi độc quyền
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-[#a10000]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#a10000]">Theo Dõi Đơn Hàng</h3>
                <p className="text-gray-600">
                  Dễ dàng theo dõi trạng thái đơn hàng và lịch sử mua sắm
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#a10000]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#a10000]">Hỗ Trợ Nhanh Chóng</h3>
                <p className="text-gray-600">
                  Được ưu tiên hỗ trợ và tư vấn từ đội ngũ chuyên nghiệp
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  );
}
