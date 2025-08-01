import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      // Default to home page
      return baseUrl
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || (user.isAdmin ? 'ADMIN' : 'USER'),
          isAdmin: user.isAdmin,
          avatar: user.avatar,
          bio: user.bio,
          phone: user.phone,
          accessToken: user.accessToken,
        };
      }
      
      // Return previous token if the access token has not expired yet
      if (token.accessToken) {
        return token;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
        isAdmin: token.isAdmin as boolean,
        avatar: token.avatar as string,
        bio: token.bio as string,
        phone: token.phone as string,
        emailVerified: null,
      };
      
      // Add access token to session for frontend to use
      session.accessToken = token.accessToken as string;
      
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          
          // Return user data that will be stored in JWT
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            isAdmin: data.user.isAdmin,
            avatar: data.user.avatar,
            bio: data.user.bio,
            phone: data.user.phone,
            role: data.user.isAdmin ? 'ADMIN' : 'USER',
            accessToken: data.access_token,
            emailVerified: null,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export default authConfig;
