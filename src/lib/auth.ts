import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { getEnv } from "@/lib/env";

const credentialsSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: getEnv().AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "الهاتف أو البريد", type: "text" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { identifier, password } = parsed.data;
        const id = identifier.toLowerCase();

        const { checkLoginAttempts, recordLoginAttempt } = await import("@/lib/login-attempt");
        const allowed = await checkLoginAttempts(id);
        if (!allowed) return null;

        const user = await db.user.findFirst({
          where: {
            OR: [
              { phone: identifier },
              { email: id },
            ],
            isActive: true,
            deletedAt: null,
          },
        });

        if (!user) {
          await recordLoginAttempt(id, false);
          return null;
        }

        const ok = await verifyPassword(user.passwordHash, password);
        if (!ok) {
          await recordLoginAttempt(id, false);
          return null;
        }

        await recordLoginAttempt(id, true);
        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          centerId: user.centerId,
        };
      },
    }),
  ],
  callbacks: {
    // @ts-expect-error - next-auth v5 types
    async jwt({ token, user }: { token: Record<string, unknown>; user?: Record<string, unknown> }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.centerId = (user.centerId as string | null) ?? null;
      }
      return token;
    },
    // @ts-expect-error - next-auth v5 types
    async session({ session, token }: { session: Record<string, unknown>; token: Record<string, unknown> }) {
      if (session.user && typeof session.user === "object") {
        const u = session.user as Record<string, unknown>;
        u.id = token.id;
        u.role = token.role;
        u.centerId = (token.centerId as string | null) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
