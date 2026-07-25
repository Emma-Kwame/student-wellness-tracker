import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? "Student Wellness Tracker <onboarding@resend.dev>";

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    // No API key configured yet — fail loudly in dev instead of silently
    // dropping the email, so the missing env var is obvious.
    console.warn(
      `[email] RESEND_API_KEY not set — would have sent "${subject}" to ${to}`,
    );
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

export async function sendVerificationEmail(to: string, url: string) {
  await send(
    to,
    "Verify your email — Student Wellness Tracker",
    `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Confirm your email</h2>
      <p>Tap the button below to verify your account and start tracking your wellness.</p>
      <a href="${url}" style="display:inline-block;padding:12px 20px;background:#4B4FE0;color:#fff;border-radius:8px;text-decoration:none;">Verify email</a>
      <p style="color:#8A8D97;font-size:13px;">If you didn't create this account, you can ignore this email.</p>
    </div>`,
  );
}

export async function sendPasswordResetEmail(to: string, url: string) {
  await send(
    to,
    "Reset your password — Student Wellness Tracker",
    `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>Tap the button below to choose a new password. This link expires in 1 hour.</p>
      <a href="${url}" style="display:inline-block;padding:12px 20px;background:#4B4FE0;color:#fff;border-radius:8px;text-decoration:none;">Reset password</a>
      <p style="color:#8A8D97;font-size:13px;">If you didn't request this, you can ignore this email.</p>
    </div>`,
  );
}
