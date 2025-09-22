import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import prisma from "./prisma";
import { compare } from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");
        if (!email || !password) {
          console.warn("authorize: missing email or password");
          return null;
        }

        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
          console.warn("authorize: user not found for", email);
          return null;
        }
        if (!user.passwordHash) {
          console.warn("authorize: user has no passwordHash", user.userId);
          return null;
        }

        try {
          const isValid = await compare(password, user.passwordHash);
          if (!isValid) {
            console.warn("authorize: invalid password for", email);
            return null;
          }
        } catch (e) {
          console.error("authorize: compare error for", email, e);
          return null;
        }

        return { id: user.userId, name: user.username, email: user.email, roleId: user.roleId };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.roleId = user.roleId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = session.user || {};
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.roleId = token.roleId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ,
};
