import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

// Use a stable secret for development if NEXTAUTH_SECRET is not set
const getSecret = () => {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET;
  }
  // Fallback secret for development - DO NOT use in production
  if (process.env.NODE_ENV === 'development') {
    return 'feai-development-secret-key-do-not-use-in-production-12345';
  }
  throw new Error('NEXTAUTH_SECRET must be set in production');
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],

  // Required on Vercel: use request host for callback URL so OAuth redirect lands on the same domain
  trustHost: true,

  // Explicitly set the secret to prevent session issues
  secret: getSecret(),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: {
    strategy: 'jwt',
    // Extend session max age to 30 days
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Force error redirects to /login on same origin (avoids /api/auth/error 404 on some hosts)
      if (url.startsWith(baseUrl + '/api/auth/error')) {
        const parsed = new URL(url);
        const error = parsed.searchParams.get('error');
        return error ? `${baseUrl}/login?error=${error}` : `${baseUrl}/login`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },

    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: true },
      });

      if (existingUser) {
        // Check if this provider is already linked
        const existingAccount = existingUser.accounts.find(
          (acc) => acc.provider === account?.provider
        );

        if (!existingAccount && account) {
          // Link new provider account to existing user
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state as string | null,
            },
          });
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.sub = user.id;
      }

      // Fetch latest user data from database on subsequent requests
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        });

        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;

        // Fetch latest user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        });

        if (dbUser) {
          session.user.name = dbUser.name;
          session.user.email = dbUser.email;
          session.user.image = dbUser.image;
        }
      }

      return session;
    },
  },

  events: {
    async createUser({ user }) {
      console.log('New user created:', user.email);
    },
  },

  // Only enable debug in development when explicitly requested
  debug: process.env.NEXTAUTH_DEBUG === 'true',
};
