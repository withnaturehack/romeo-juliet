import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn("RESEND_API_KEY is not set. Emails will be skipped.");
    return null;
  }
  if (!resend) resend = new Resend(key);
  return resend;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const client = getResend();
  if (!client) return;

  try {
    await client.emails.send({
      from: "Romeo & Juliet <hello@romeojuliet.love>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email send failed (non-fatal):", err);
  }
}
