import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/client";
import * as authSchema from "@/db/schema/auth";

const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev fallback: log to console
    console.log(`[AUTH EMAIL] To: ${to}\nSubject: ${subject}\n${html}`);
    return;
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "MS Portfolio <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });
}

export const auth = betterAuth({
  baseURL: BASE_URL,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user:         authSchema.users,
      session:      authSchema.sessions,
      account:      authSchema.accounts,
      verification: authSchema.verifications,
    },
  }),

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        user.email,
        "Reset your MS Portfolio password",
        `
        <div style="font-family:monospace;background:#05080f;color:#e2eaf6;padding:32px;border-radius:12px;max-width:480px;">
          <img src="${BASE_URL}/icons/Actual_Logo.ico" width="48" height="48" style="margin-bottom:16px;" />
          <h2 style="color:#00d4ff;margin:0 0 8px;">Password Reset</h2>
          <p style="color:#7a8fa6;margin:0 0 24px;">Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${url}" style="background:#00d4ff;color:#000;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;display:inline-block;">
            Reset Password →
          </a>
          <p style="color:#334155;font-size:12px;margin-top:24px;">If you didn't request this, ignore this email.</p>
        </div>
        `
      );
    },
  },

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
