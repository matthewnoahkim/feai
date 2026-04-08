import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '../prisma';

const getSecret = () => {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET;
  }
  if (process.env.NODE_ENV === 'development') {
    return 'feai-development-secret-key-do-not-use-in-production-12345';
  }
  throw new Error('NEXTAUTH_SECRET must be set in production');
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
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
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl + '/api/auth/error')) {
        const parsed = new URL(url);
        const error = parsed.searchParams.get('error');
        return error ? `${baseUrl}/login?error=${error}` : `${baseUrl}/login`;
      }
      const loginPath = baseUrl + '/login';
      if (url === loginPath || url.startsWith(loginPath + '?')) {
        return baseUrl + '/dashboard';
      }
      // After sign-in, send users to dashboard instead of homepage when callback was root
      const root = baseUrl.replace(/\/$/, '');
      if (url === root || url === root + '/' || url === '/' || url.startsWith('/?')) {
        return root + '/dashboard';
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },

    async signIn({ user }) {
      // Require email for Google. Linking/creating Account rows is handled by
      // PrismaAdapter (including email account linking via
      // allowDangerousEmailAccountLinking). Do not create Account here — that
      // duplicates linkAccount and triggers a unique constraint on
      // (provider, providerAccountId), which surfaces as OAuthCallback.
      if (!user.email) {
        return false;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }

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

  debug: process.env.NEXTAUTH_DEBUG === 'true',
};
