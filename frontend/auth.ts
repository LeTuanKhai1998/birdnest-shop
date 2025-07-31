import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

export const runtime = 'nodejs';

type AuthUser = { id: string; isAdmin: boolean; email: string; name?: string; avatar?: string; bio?: string };

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'you@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Use backend API for authentication
          const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            isAdmin: data.user.isAdmin,
            avatar: data.user.avatar,
            bio: data.user.bio,
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
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as AuthUser).id;
        token.isAdmin = (user as AuthUser).isAdmin;
        token.avatar = (user as AuthUser).avatar;
        token.bio = (user as AuthUser).bio;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as AuthUser).id = token.id as string;
        (session.user as AuthUser).isAdmin = token.isAdmin as boolean;
        (session.user as AuthUser).avatar = token.avatar as string;
        (session.user as AuthUser).bio = token.bio as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('[AUTH] WARNING: NEXTAUTH_SECRET is not set in the environment. Credential logins will fail.');
}
