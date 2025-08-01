import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: string
      isAdmin: boolean
      avatar?: string
      bio?: string
      phone?: string
    }
    accessToken?: string
  }

  interface User {
    id: string
    email: string
    name?: string
    role?: string
    isAdmin: boolean
    avatar?: string
    bio?: string
    phone?: string
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    isAdmin?: boolean
    avatar?: string
    bio?: string
    phone?: string
    accessToken?: string
  }
} 