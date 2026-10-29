import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
          await logAction({
            action: "login.failed",
            entityType: "User",
            entityId: null,
            metadata: { email, reason: !user ? "not_found" : "inactive" },
          });
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          await logAction({
            userId: user.id,
            action: "login.failed",
            entityType: "User",
            entityId: user.id,
            metadata: { email, reason: "bad_password" },
          });
          return null;
        }

        await logAction({
          userId: user.id,
          action: "login.success",
          entityType: "User",
          entityId: user.id,
          metadata: { email },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
