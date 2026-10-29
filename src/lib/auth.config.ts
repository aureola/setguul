import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
  }
}

interface AppJWT {
  id: string;
  role: Role;
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        (token as unknown as AppJWT).id = user.id as string;
        (token as unknown as AppJWT).role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      const appToken = token as unknown as AppJWT;
      session.user.id = appToken.id;
      session.user.role = appToken.role;
      return session;
    },
  },
};
