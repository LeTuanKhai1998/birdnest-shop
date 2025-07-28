import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";

// Settings schema validation
const SettingsSchema = z.object({
  // General Settings
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().optional(),
  siteUrl: z.string().url("Invalid URL format").optional(),
  contactEmail: z.string().email("Invalid email format"),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  
  // Business Settings
  currency: z.enum(["VND", "USD", "EUR"]),
  taxRate: z.number().min(0).max(100),
  shippingCost: z.number().min(0),
  freeShippingThreshold: z.number().min(0),
  
  // Social Media
  facebookUrl: z.string().url("Invalid URL format").optional(),
  instagramUrl: z.string().url("Invalid URL format").optional(),
  zaloUrl: z.string().url("Invalid URL format").optional(),
  
  // Email Settings
  smtpHost: z.string().optional(),
  smtpPort: z.number().min(1).max(65535).optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  emailFrom: z.string().email("Invalid email format").optional(),
  
  // Payment Settings
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  momoApiKey: z.string().optional(),
  vnpayApiKey: z.string().optional(),
  
  // SEO Settings
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  
  // Feature Flags
  enableReviews: z.boolean(),
  enableWishlist: z.boolean(),
  enableNewsletter: z.boolean(),
  enableStockAlerts: z.boolean(),
  enableEmailNotifications: z.boolean(),
  
  // Security Settings
  maxLoginAttempts: z.number().min(1).max(10),
  sessionTimeout: z.number().min(5).max(1440), // minutes
  requireEmailVerification: z.boolean(),
  
  // Maintenance Settings
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
  
  // Notification Settings
  lowStockThreshold: z.number().min(1),
  orderNotificationEmail: z.string().email("Invalid email format").optional(),
  adminNotificationEmail: z.string().email("Invalid email format").optional(),
});

type Settings = z.infer<typeof SettingsSchema>;

// Default settings
const defaultSettings: Settings = {
  siteName: "Bird's Nest Shop",
  siteDescription: "Premium bird's nest products from Kien Giang",
  siteUrl: "https://birdnest-shop.com",
  contactEmail: "contact@birdnest-shop.com",
  contactPhone: "+84 901 234 567",
  address: "123 Bird's Nest Street, Ho Chi Minh City, Vietnam",
  currency: "VND",
  taxRate: 10,
  shippingCost: 50000,
  freeShippingThreshold: 1000000,
  facebookUrl: "https://facebook.com/birdnestshop",
  instagramUrl: "https://instagram.com/birdnestshop",
  zaloUrl: "https://zalo.me/birdnestshop",
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPassword: "",
  emailFrom: "noreply@birdnest-shop.com",
  stripePublicKey: "",
  stripeSecretKey: "",
  stripeWebhookSecret: "",
  momoApiKey: "",
  vnpayApiKey: "",
  metaTitle: "Bird's Nest Shop - Premium Quality Products",
  metaDescription: "Discover premium bird's nest products from Kien Giang. High quality, authentic products for your health and wellness.",
  metaKeywords: "bird's nest, kien giang, premium, health, wellness",
  googleAnalyticsId: "",
  enableReviews: true,
  enableWishlist: true,
  enableNewsletter: true,
  enableStockAlerts: true,
  enableEmailNotifications: true,
  maxLoginAttempts: 5,
  sessionTimeout: 60,
  requireEmailVerification: false,
  maintenanceMode: false,
  maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
  lowStockThreshold: 10,
  orderNotificationEmail: "orders@birdnest-shop.com",
  adminNotificationEmail: "admin@birdnest-shop.com",
};

// In-memory storage for settings (in production, use database)
let currentSettings: Settings = { ...defaultSettings };

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: currentSettings,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedSettings = SettingsSchema.parse(body);

    // Update settings
    currentSettings = { ...currentSettings, ...validatedSettings };

    // In production, save to database here
    // await prisma.settings.upsert({
    //   where: { id: 1 },
    //   update: validatedSettings,
    //   create: { id: 1, ...validatedSettings },
    // });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: currentSettings,
    });
  } catch (error) {
    console.error("Settings PUT error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation error", 
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get settings (for use in other parts of the app)
export async function getSettings(): Promise<Settings> {
  return currentSettings;
} 