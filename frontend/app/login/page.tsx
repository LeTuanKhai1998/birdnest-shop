'use client';
import { Suspense, useEffect } from 'react';
import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Loader2, Lock, AlertCircle, CheckCircle } from 'lucide-react';

function LoginPageInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const { data: session, status } = useSession();

  // Clear any stuck authentication data on component mount
  useEffect(() => {
    
    // Only clear auth data if we're not trying to access admin pages
    // This prevents the redirect loop between /admin and /login
    if (!callbackUrl.includes('/admin')) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
    }
  }, [callbackUrl]);

  // Check if user is already authenticated
  useEffect(() => {
    
    // Check for admin authentication in localStorage
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        // For admin users, only redirect to admin pages
        if (user.isAdmin && callbackUrl.includes('/admin')) {
          router.push(callbackUrl);
          return;
        }
        // For admin users trying to access non-admin pages, redirect to admin dashboard
        if (user.isAdmin && !callbackUrl.includes('/admin')) {
          router.push('/admin');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Check for NextAuth session
    if (status === 'authenticated' && session?.user) {
      router.push(callbackUrl);
      return;
    }
  }, [session, status, router, callbackUrl]);

  // Temporarily bypass all authentication checks to show login form
  console.log('Bypassing authentication checks to show login form');
  console.log('Status:', status, 'Session:', !!session);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Use NextAuth signIn with redirect disabled to handle errors
      const res = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });
      
      setLoading(false);
      
      if (res?.error) {
        if (res.error === 'CredentialsSignin') {
          setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        } else {
          setError(res.error);
          toast.error('Đăng nhập thất bại: ' + res.error);
        }
      } else if (res?.ok) {
        // Success - redirect to the callback URL or home
        router.push(callbackUrl);
      } else {
        setError('Đăng nhập thất bại: Lỗi không xác định');
        toast.error('Đăng nhập thất bại: Lỗi không xác định');
      }
    } catch (error) {
      setLoading(false);
      setError('Đăng nhập thất bại: Lỗi không xác định');
      toast.error('Đăng nhập thất bại: Lỗi không xác định');
    }
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
              Đăng Nhập
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Đăng nhập vào tài khoản của bạn để tiếp tục
            </p>
          </div>
        </div>
      </section>

      {/* Login Form Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-[#a10000]">
                <Lock className="w-6 h-6" />
                Đăng Nhập Tài Khoản
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Nhập thông tin đăng nhập của bạn
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
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
                      autoComplete="current-password"
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
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng Nhập'
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
                  onClick={() => signIn('google', { callbackUrl })}
                  disabled={loading}
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">Đăng nhập với Google</span>
                </Button>
              </div>
              
              <div className="text-center pt-4 pb-8">
                <p className="text-sm text-gray-600">
                  Chưa có tài khoản?{' '}
                  <a 
                    href="/signup" 
                    className="text-[#a10000] hover:text-red-800 font-medium hover:underline transition-colors"
                  >
                    Đăng ký ngay
                  </a>
                </p>
                {/* Debug section - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Debug Info:</p>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('auth-token');
                        localStorage.removeItem('user');
                        window.location.reload();
                      }}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Clear Auth Data & Reload
                    </button>
                  </div>
                )}
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
              Tại Sao Chọn Chúng Tôi?
            </h2>
            <p className="text-lg text-gray-600">
              Trải nghiệm dịch vụ khách hàng tốt nhất
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#a10000]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#a10000]">Bảo Mật Cao</h3>
                <p className="text-gray-600">
                  Thông tin tài khoản của bạn được bảo vệ an toàn với công nghệ mã hóa tiên tiến
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-[#a10000]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#a10000]">Đăng Nhập Nhanh</h3>
                <p className="text-gray-600">
                  Quy trình đăng nhập đơn giản và nhanh chóng với nhiều phương thức xác thực
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#a10000]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#a10000]">Hỗ Trợ 24/7</h3>
                <p className="text-gray-600">
                  Đội ngũ hỗ trợ khách hàng luôn sẵn sàng giúp đỡ bạn mọi lúc
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
