import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: authConfig.providers.map((provider) => {
    if (provider.name === "Credentials") {
      return {
        ...provider,
        async authorize(credentials) {
          console.log("CREDENTIALS:", credentials);
          // Mock user for dev
          if (
            credentials.email === "test@demo.com" &&
            credentials.password === "Test@1234"
          ) {
            return {
              id: "mock-user-id",
              email: "test@demo.com",
              name: "Test User",
              isAdmin: false,
            };
          }
          // Real DB logic
          const email = credentials.email?.toString() || "";
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) return null;
          const password = credentials.password?.toString() || "";
          const userPassword = typeof user.password === "string" ? user.password : "";
          const isValid = await bcrypt.compare(password, userPassword);
          if (!isValid) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
          };
        },
      };
    }
    return provider;
  }),
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
  secret: process.env.AUTH_SECRET,
}); 