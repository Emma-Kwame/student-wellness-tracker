import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },

  session: {
    // 30-day session, refreshed whenever a request lands in the last 24h —
    // matches "remember me" expectations without forcing constant re-login.
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  user: {
    additionalFields: {
      // Kept minimal on the User model itself — everything else (goals,
      // streaks, university, etc.) lives on UserProfile, created via the
      // databaseHooks below right after signup.
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.userProfile.create({
            data: { userId: user.id },
          });
        },
      },
    },
  },

  advanced: {
    database: {
      generateId: false, // let Prisma's cuid() default handle IDs
    },
  },
});

export type Session = typeof auth.$Infer.Session;
