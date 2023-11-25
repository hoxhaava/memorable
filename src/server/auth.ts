import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  DefaultSession,
  getServerSession,
  type NextAuthOptions,
} from "next-auth";
import { type JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from 'next-auth/providers/discord';

declare module 'next-auth/jwt' {
  interface JWT {
    username: string
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      username: string
    } & DefaultSession["user"]
  }

  interface User {
    username: string
  }
}


import { env } from "~/env.mjs";
import { db } from "~/server/db";

const providers = [];

if (env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET) {
  providers.push(DiscordProvider({
    clientId: env.DISCORD_CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET,
  }));
}

providers.push(CredentialsProvider({
  name: 'password',
  credentials: {
    username: { label: 'Username', type: 'text' },
    password: { label: 'Password', type: 'password' }
  },
  async authorize(credentials) {
    const user = await db.user.findUnique({
      where: {
        username: credentials?.username
      }
    })

    // TODO: Password should be stored as hash
    if (user && user.password == credentials?.password) {
      return user;
    }

    return null;
  }
}))

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.username = user.username;
      }
      return Promise.resolve(token);
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.name = token.name;
      }

      // session.user.image = token.user.image;
      return Promise.resolve(session);
    }
  },
  adapter: PrismaAdapter(db),
  providers,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
