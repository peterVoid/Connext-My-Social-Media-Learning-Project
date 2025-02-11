import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { db } from "@/server/db";
import * as bcrypt from "bcrypt";
import NextAuth, { AuthOptions, getServerSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      firstname: string;
      surname?: string | null;
      image?: string | null;
      email: string;
      emailVerified?: Date | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      username?: string | null;
      firstname: string;
      surname?: string | null;
      image?: string | null;
      email: string;
      emailVerified?: Date | null;
    };
  }
}

export const authConfig: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials, req) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await db.user.findUnique({
          where: {
            email: email as string,
          },
        });

        if (!user?.hashedPassword) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          password as string,
          user.hashedPassword,
        );

        if (!isValidPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.firstname,
          image: user.image,
          username: user.username,
          surname: user.surname,
          emailVerified: user.emailVerified,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    async jwt({ token, user }) {
      // console.log("JWT Callback - Token:", token);
      // console.log("JWT Callback - User:", user);

      if (user) {
        token.user = {
          id: user.id,
          firstname: user.name ?? "",
          email: user.email ?? "",
        };
      }

      if (!token.user?.id) return token;

      const dbUser = await db.user.findUnique({
        where: { id: token.user.id },
      });

      if (dbUser) {
        token.user = {
          id: dbUser.id ?? "",
          username: dbUser.username ?? null,
          surname: dbUser.surname ?? null,
          firstname: dbUser.firstname ?? "",
          image: dbUser.image ?? null,
          email: dbUser.email ?? "",
          emailVerified: dbUser.emailVerified ?? null,
        };
      }

      return token;
    },
    async session({ session, token }) {
      // console.log("Session Callback - Token:", token);
      // console.log("Session Callback - Session:", session);

      if (session.user) {
        session.user = {
          ...session.user,
          id: token.user?.id ?? "",
          username: token.user?.username ?? null,
          surname: token.user?.surname ?? null,
          firstname: token.user?.firstname ?? "",
          image: token.user?.image ?? null,
          email: token.user?.email ?? "",
          emailVerified: token.user?.emailVerified ?? null,
        };
      }

      return session;
    },
  },
};

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };

export const getAuthSession = () => getServerSession(authConfig);
