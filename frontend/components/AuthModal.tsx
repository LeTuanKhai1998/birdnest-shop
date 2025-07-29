"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Phone, ArrowRight, Shield, Clock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: "login" | "register" | "guest";
}

export function AuthModal({ isOpen, onClose, onSuccess, mode = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<string>(mode);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email hoặc mật khẩu không hợp lệ");
      } else {
        toast.success("Đăng nhập thành công!");
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi trong quá trình đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
        }),
      });

      if (response.ok) {
        // Auto-login after successful registration
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Đăng ký thành công nhưng đăng nhập thất bại. Vui lòng thử đăng nhập.");
        } else {
          toast.success("Tài khoản đã được tạo và đăng nhập thành công!");
          onSuccess();
          onClose();
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Đăng ký thất bại");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi trong quá trình đăng ký");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestCheckout = () => {
    toast.success("Tiếp tục với tư cách khách");
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 border-b">
          <DialogHeader className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Hoàn Tất Đơn Hàng</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">Chọn cách bạn muốn tiếp tục</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="login"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-red-600 rounded-md"
              >
                <User className="w-4 h-4 mr-2" />
                Đăng Nhập
              </TabsTrigger>
              <TabsTrigger 
                value="guest"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-red-600 rounded-md"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Khách
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chào Mừng Trở Lại</h3>
                <p className="text-sm text-gray-600">Đăng nhập vào tài khoản hiện có</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Mật Khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Nhập mật khẩu của bạn"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-5 w-5" />
                      Đăng Nhập
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="guest" className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ArrowRight className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tiếp Tục Làm Khách</h3>
                <p className="text-sm text-gray-600">Không cần tài khoản để hoàn tất đơn hàng</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">Lợi ích khi thanh toán khách:</p>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Hoàn tất đơn hàng ngay lập tức</li>
                        <li>• Không cần tạo tài khoản</li>
                        <li>• Tạo tài khoản sau để theo dõi đơn hàng</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleGuestCheckout} 
                  className="w-full h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Tiếp Tục Làm Khách
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 