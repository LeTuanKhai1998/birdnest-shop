import NextAuth from "next-auth"
import authConfig from "./auth.config"

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
  
  interface User {
    accessToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
