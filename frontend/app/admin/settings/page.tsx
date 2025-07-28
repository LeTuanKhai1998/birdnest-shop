"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Store, 
  Mail, 
  CreditCard, 
  Truck, 
  Shield, 
  Globe, 
  Database,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface SettingsData {
  // General Settings
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  
  // Business Settings
  currency: "VND" | "USD" | "EUR";
  taxRate: number;
  shippingCost: number;
  freeShippingThreshold: number;
  
  // Social Media
  facebookUrl: string;
  instagramUrl: string;
  zaloUrl: string;
  
  // Email Settings
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  emailFrom: string;
  
  // Payment Settings
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  momoApiKey: string;
  vnpayApiKey: string;
  
  // SEO Settings
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  
  // Feature Flags
  enableReviews: boolean;
  enableWishlist: boolean;
  enableNewsletter: boolean;
  enableStockAlerts: boolean;
  enableEmailNotifications: boolean;
  
  // Security Settings
  maxLoginAttempts: number;
  sessionTimeout: number;
  requireEmailVerification: boolean;
  
  // Maintenance Settings
  maintenanceMode: boolean;
  maintenanceMessage: string;
  
  // Notification Settings
  lowStockThreshold: number;
  orderNotificationEmail: string;
  adminNotificationEmail: string;
}

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    if (!session.user.isAdmin) {
      router.push("/admin");
      return;
    }

    loadSettings();
  }, [session, status, router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      if (!response.ok) {
        throw new Error("Failed to load settings");
      }
      const data = await response.json();
      setSettings(data.data);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings");
      }

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof SettingsData, value: string | number | boolean) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load settings</h2>
          <Button onClick={loadSettings} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your store settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic store information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name *</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange("siteName", e.target.value)}
                    placeholder="Bird's Nest Shop"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => handleSettingChange("siteUrl", e.target.value)}
                    placeholder="https://birdnest-shop.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleSettingChange("contactEmail", e.target.value)}
                    placeholder="contact@birdnest-shop.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone}
                    onChange={(e) => handleSettingChange("contactPhone", e.target.value)}
                    placeholder="+84 901 234 567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
                  placeholder="Premium bird's nest products from Kien Giang"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleSettingChange("address", e.target.value)}
                  placeholder="123 Bird's Nest Street, Ho Chi Minh City, Vietnam"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Social Media
              </CardTitle>
              <CardDescription>
                Social media links for your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook URL</Label>
                  <Input
                    id="facebookUrl"
                    value={settings.facebookUrl}
                    onChange={(e) => handleSettingChange("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/birdnestshop"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    value={settings.instagramUrl}
                    onChange={(e) => handleSettingChange("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/birdnestshop"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zaloUrl">Zalo URL</Label>
                  <Input
                    id="zaloUrl"
                    value={settings.zaloUrl}
                    onChange={(e) => handleSettingChange("zaloUrl", e.target.value)}
                    placeholder="https://zalo.me/birdnestshop"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Business Settings
              </CardTitle>
              <CardDescription>
                Configure currency, taxes, and shipping settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                                         onValueChange={(value: string) => handleSettingChange("currency", value as "VND" | "USD" | "EUR")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND (Vietnamese Dong)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => handleSettingChange("taxRate", parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Default Shipping Cost</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    min="0"
                    value={settings.shippingCost}
                    onChange={(e) => handleSettingChange("shippingCost", parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    min="0"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => handleSettingChange("freeShippingThreshold", parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Settings
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => handleSettingChange("smtpHost", e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    min="1"
                    max="65535"
                    value={settings.smtpPort}
                    onChange={(e) => handleSettingChange("smtpPort", parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) => handleSettingChange("smtpUser", e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <div className="relative">
                    <Input
                      id="smtpPassword"
                      type={showPasswords ? "text" : "password"}
                      value={settings.smtpPassword}
                      onChange={(e) => handleSettingChange("smtpPassword", e.target.value)}
                      placeholder="your-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailFrom">From Email</Label>
                  <Input
                    id="emailFrom"
                    type="email"
                    value={settings.emailFrom}
                    onChange={(e) => handleSettingChange("emailFrom", e.target.value)}
                    placeholder="noreply@birdnest-shop.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Settings
              </CardTitle>
              <CardDescription>
                Configure payment gateway settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stripe Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripePublicKey">Public Key</Label>
                    <div className="relative">
                      <Input
                        id="stripePublicKey"
                        type={showPasswords ? "text" : "password"}
                        value={settings.stripePublicKey}
                        onChange={(e) => handleSettingChange("stripePublicKey", e.target.value)}
                        placeholder="pk_test_..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => copyToClipboard(settings.stripePublicKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripeSecretKey">Secret Key</Label>
                    <div className="relative">
                      <Input
                        id="stripeSecretKey"
                        type={showPasswords ? "text" : "password"}
                        value={settings.stripeSecretKey}
                        onChange={(e) => handleSettingChange("stripeSecretKey", e.target.value)}
                        placeholder="sk_test_..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => copyToClipboard(settings.stripeSecretKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripeWebhookSecret">Webhook Secret</Label>
                    <div className="relative">
                      <Input
                        id="stripeWebhookSecret"
                        type={showPasswords ? "text" : "password"}
                        value={settings.stripeWebhookSecret}
                        onChange={(e) => handleSettingChange("stripeWebhookSecret", e.target.value)}
                        placeholder="whsec_..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => copyToClipboard(settings.stripeWebhookSecret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vietnamese Payment Methods</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="momoApiKey">MoMo API Key</Label>
                    <div className="relative">
                      <Input
                        id="momoApiKey"
                        type={showPasswords ? "text" : "password"}
                        value={settings.momoApiKey}
                        onChange={(e) => handleSettingChange("momoApiKey", e.target.value)}
                        placeholder="MoMo API Key"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => copyToClipboard(settings.momoApiKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vnpayApiKey">VNPay API Key</Label>
                    <div className="relative">
                      <Input
                        id="vnpayApiKey"
                        type={showPasswords ? "text" : "password"}
                        value={settings.vnpayApiKey}
                        onChange={(e) => handleSettingChange("vnpayApiKey", e.target.value)}
                        placeholder="VNPay API Key"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => copyToClipboard(settings.vnpayApiKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                SEO Settings
              </CardTitle>
              <CardDescription>
                Configure search engine optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={settings.metaTitle}
                  onChange={(e) => handleSettingChange("metaTitle", e.target.value)}
                  placeholder="Bird's Nest Shop - Premium Quality Products"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.metaDescription}
                  onChange={(e) => handleSettingChange("metaDescription", e.target.value)}
                  placeholder="Discover premium bird's nest products from Kien Giang..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  value={settings.metaKeywords}
                  onChange={(e) => handleSettingChange("metaKeywords", e.target.value)}
                  placeholder="bird's nest, kien giang, premium, health, wellness"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => handleSettingChange("googleAnalyticsId", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Enable or disable specific features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableReviews">Enable Reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to leave product reviews
                    </p>
                  </div>
                  <Switch
                    id="enableReviews"
                    checked={settings.enableReviews}
                                         onCheckedChange={(checked: boolean) => handleSettingChange("enableReviews", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableWishlist">Enable Wishlist</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to save favorite products
                    </p>
                  </div>
                  <Switch
                    id="enableWishlist"
                    checked={settings.enableWishlist}
                                         onCheckedChange={(checked: boolean) => handleSettingChange("enableWishlist", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableNewsletter">Enable Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to subscribe to newsletters
                    </p>
                  </div>
                  <Switch
                    id="enableNewsletter"
                    checked={settings.enableNewsletter}
                    onCheckedChange={(checked) => handleSettingChange("enableNewsletter", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableStockAlerts">Enable Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify customers when products are back in stock
                    </p>
                  </div>
                  <Switch
                    id="enableStockAlerts"
                    checked={settings.enableStockAlerts}
                    onCheckedChange={(checked) => handleSettingChange("enableStockAlerts", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications for orders and updates
                    </p>
                  </div>
                  <Switch
                    id="enableEmailNotifications"
                    checked={settings.enableEmailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("enableEmailNotifications", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange("maxLoginAttempts", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange("sessionTimeout", parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require email verification for new user registrations
                  </p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => handleSettingChange("requireEmailVerification", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Maintenance Settings
              </CardTitle>
              <CardDescription>
                Configure maintenance mode and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to temporarily disable the store
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={settings.maintenanceMessage}
                  onChange={(e) => handleSettingChange("maintenanceMessage", e.target.value)}
                  placeholder="We're currently performing maintenance. Please check back soon."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="1"
                  value={settings.lowStockThreshold}
                  onChange={(e) => handleSettingChange("lowStockThreshold", parseInt(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNotificationEmail">Order Notification Email</Label>
                  <Input
                    id="orderNotificationEmail"
                    type="email"
                    value={settings.orderNotificationEmail}
                    onChange={(e) => handleSettingChange("orderNotificationEmail", e.target.value)}
                    placeholder="orders@birdnest-shop.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminNotificationEmail">Admin Notification Email</Label>
                  <Input
                    id="adminNotificationEmail"
                    type="email"
                    value={settings.adminNotificationEmail}
                    onChange={(e) => handleSettingChange("adminNotificationEmail", e.target.value)}
                    placeholder="admin@birdnest-shop.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 