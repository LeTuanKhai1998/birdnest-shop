"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Phone, Sparkles, ArrowRight, Shield, Clock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: "login" | "register" | "quick";
}

export function AuthModal({ isOpen, onClose, onSuccess, mode = "quick" }: AuthModalProps) {
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

  const generateDefaultPassword = () => {
    // Generate a random 8-character password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleEmailAutoRegister = async (email: string) => {
    setIsLoading(true);
    
    try {
      // Generate default values
      const defaultPassword = generateDefaultPassword();
      const emailParts = email.split('@')[0]; // Use part before @ as name
      const defaultName = emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
      
      // Auto-register with default values
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: defaultPassword,
          fullName: defaultName,
          phone: email, // Use email as phone number
        }),
      });

      if (response.ok) {
        // Auto-login after successful registration
        const result = await signIn("credentials", {
          email: email,
          password: defaultPassword,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Account created but login failed. Please try signing in manually.");
        } else {
          toast.success(`Account created successfully! Email: ${email}, Password: ${defaultPassword}`);
          onSuccess();
          onClose();
        }
      } else {
        const error = await response.json();
        if (error.message?.includes("already exists")) {
          // If account exists, try to login
          toast.info("Account already exists. Trying to sign in...");
          const result = await signIn("credentials", {
            email: email,
            password: defaultPassword,
            redirect: false,
          });

          if (result?.error) {
            toast.error("Account exists but password doesn't match. Please use the Sign In tab.");
          } else {
            toast.success("Successfully signed in!");
            onSuccess();
            onClose();
          }
        } else {
          toast.error(error.message || "Registration failed");
        }
      }
    } catch (error) {
      toast.error("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
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
        toast.error("Invalid email or password");
      } else {
        toast.success("Successfully signed in!");
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error("An error occurred during sign in");
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
          toast.error("Registration successful but login failed. Please try logging in.");
        } else {
          toast.success("Account created and signed in successfully!");
          onSuccess();
          onClose();
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestCheckout = () => {
    toast.success("Continuing as guest");
    onSuccess();
    onClose();
  };

  const handleQuickSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }
    
    // Try auto-register with email
    await handleEmailAutoRegister(formData.email);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 border-b">
          <DialogHeader className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Complete Your Order</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">Choose how you'd like to proceed</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="quick" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-red-600 rounded-md"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Quick
              </TabsTrigger>
              <TabsTrigger 
                value="login"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-red-600 rounded-md"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="guest"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-red-600 rounded-md"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Guest
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Sign In</h3>
                <p className="text-sm text-gray-600">Enter your email and we'll handle the rest</p>
              </div>

              <form onSubmit={handleQuickSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quick-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="quick-email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating your account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Quick Sign In
                    </>
                  )}
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">What happens next?</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• We'll create an account for you automatically</li>
                        <li>• Generate a secure password</li>
                        <li>• Sign you in immediately</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="login" className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome Back</h3>
                <p className="text-sm text-gray-600">Sign in to your existing account</p>
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
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-5 w-5" />
                      Sign In
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Continue as Guest</h3>
                <p className="text-sm text-gray-600">No account needed to complete your order</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">Guest checkout benefits:</p>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Complete your order immediately</li>
                        <li>• No account creation required</li>
                        <li>• Create account later to track orders</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleGuestCheckout} 
                  className="w-full h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Continue as Guest
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 