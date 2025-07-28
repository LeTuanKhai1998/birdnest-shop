import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setStoredToken } from "@/lib/api-config";

export const runtime = "nodejs";

console.log("[AUTH] Loaded auth.ts");

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("[AUTH] WARNING: NEXTAUTH_SECRET is not set in the environment. Credential logins will fail.");
}

type AuthUser = { id: string; isAdmin: boolean; email: string; name?: string };

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[DEBUG] Received credentials:", credentials);
        
        try {
          // First, try to authenticate with the backend API
          const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1'}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (backendResponse.ok) {
            const backendData = await backendResponse.json();
            console.log("[DEBUG] Backend auth successful:", backendData);
            
            // Store the backend token in localStorage for API calls
            const accessToken = backendData.tokens?.access?.token;
            if (accessToken) {
              // Note: This will be called on the server side, so we need to handle token storage differently
              console.log("[DEBUG] Backend token received:", accessToken.substring(0, 20) + "...");
            }
            
            // Store the backend token in the user object
            const user: AuthUser & { backendToken?: string; refreshToken?: string } = {
              id: backendData.user?.id || "backend-user-id",
              email: credentials.email?.toString() || "",
              name: backendData.user?.name || credentials.email?.toString() || "",
              isAdmin: backendData.user?.isAdmin || false,
              backendToken: accessToken,
              refreshToken: backendData.tokens?.refresh?.token,
            };
            
            return user;
          } else {
            console.log("[DEBUG] Backend auth failed:", backendResponse.status);
            const errorData = await backendResponse.json().catch(() => ({}));
            console.log("[DEBUG] Backend error:", errorData);
          }
        } catch (error) {
          console.log("[DEBUG] Backend auth failed, falling back to local auth:", error);
        }

        // Mock user for dev (fallback)
        if (
          (credentials.email === "test@demo.com" && credentials.password === "Test@1234") ||
          (credentials.email === "demo@demo.com" && credentials.password === "Demo@1234") ||
          (credentials.email === "user@example.com" && credentials.password === "123456") ||
          (credentials.email === "admin@birdnest.com" && credentials.password === "admin123")
        ) {
          console.log("[DEBUG] Using mock/demo user branch");
          return {
            id: "mock-demo-id",
            email: credentials.email!,
            name: credentials.email === "demo@demo.com" ? "Demo User" : 
                  credentials.email === "user@example.com" ? "Test User" : 
                  credentials.email === "admin@birdnest.com" ? "Admin User" : "Test User",
            isAdmin: credentials.email === "admin@birdnest.com",
          };
        }
        
        // Real DB logic (fallback)
        console.log("[DEBUG] Using real DB user branch");
        const email = credentials.email?.toString() || "";
        const user = await prisma.user.findUnique({ where: { email } });
        console.log("[DEBUG] DB user found:", user);
        if (!user || !user.password) {
          console.log("[DEBUG] No user or password found");
          return null;
        }
        const password = credentials.password?.toString() || "";
        const userPassword = typeof user.password === "string" ? user.password : "";
        const isValid = await bcrypt.compare(password, userPassword);
        console.log("[DEBUG] Password valid:", isValid);
        if (!isValid) {
          console.log("[DEBUG] Password invalid");
          return null;
        }
        // Update lastLoginAt
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } as any });
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as AuthUser).id;
        token.isAdmin = (user as AuthUser).isAdmin;
        // Store backend token in JWT
        if ((user as any).backendToken) {
          token.backendToken = (user as any).backendToken;
        }
        if ((user as any).refreshToken) {
          token.refreshToken = (user as any).refreshToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as AuthUser).id = token.id as string;
        (session.user as AuthUser).isAdmin = token.isAdmin as boolean;
        // Store backend token in session
        if (token.backendToken) {
          (session as any).backendToken = token.backendToken;
        }
        if (token.refreshToken) {
          (session as any).refreshToken = token.refreshToken;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}); 