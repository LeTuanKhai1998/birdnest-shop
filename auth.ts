import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export const runtime = "nodejs";

console.log("[AUTH] Loaded auth.ts");

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("[AUTH] WARNING: NEXTAUTH_SECRET is not set in the environment. Credential logins will fail.");
}

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
        // Mock user for dev
        if (
          (credentials.email === "test@demo.com" && credentials.password === "Test@1234") ||
          (credentials.email === "demo@demo.com" && credentials.password === "Demo@1234") ||
          (credentials.email === "user@example.com" && credentials.password === "123456")
        ) {
          console.log("[DEBUG] Using mock/demo user branch");
          return {
            id: "mock-demo-id",
            email: credentials.email,
            name: credentials.email === "demo@demo.com" ? "Demo User" : credentials.email === "user@example.com" ? "Test User" : "Test User",
            isAdmin: false,
          };
        }
        // Real DB logic
        console.log("[DEBUG] Using real DB user branch");
        const email = credentials.email?.toString() || "";
        const user = await prisma.user.findUnique({ where: { email } });
        console.log("[DEBUG] DB user found:", user);
        if (!user || !user.password) {
          console.log("[DEBUG] No user or password found");
          await new Promise(res => setTimeout(res, 5000));
          return null;
        }
        const password = credentials.password?.toString() || "";
        const userPassword = typeof user.password === "string" ? user.password : "";
        const isValid = await bcrypt.compare(password, userPassword);
        console.log("[DEBUG] Password valid:", isValid);
        if (!isValid) {
          console.log("[DEBUG] Password invalid");
          await new Promise(res => setTimeout(res, 5000));
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id as string;
        (session.user as any).isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}); 