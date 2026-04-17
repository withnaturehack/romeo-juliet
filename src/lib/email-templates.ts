const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://romeojuliet.love";

function baseTemplate(title: string, body: string, ctaText: string, ctaUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Georgia',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#FDFAF4;border-radius:16px;overflow:hidden;">
<tr><td style="background:#4A5E41;padding:32px 40px;text-align:center;">
<h1 style="margin:0;color:#FFFFFF;font-family:'Georgia',serif;font-size:28px;font-weight:400;letter-spacing:0.02em;">Romeo &amp; Juliet</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-family:sans-serif;font-size:13px;">A better way to meet someone</p>
</td></tr>
<tr><td style="padding:40px 40px 32px;">
${body}
<div style="text-align:center;margin:32px 0 0;">
<a href="${ctaUrl}" style="display:inline-block;background:#4A5E41;color:#FFFFFF;text-decoration:none;font-family:sans-serif;font-size:14px;font-weight:500;padding:14px 32px;border-radius:100px;">${ctaText}</a>
</div>
</td></tr>
<tr><td style="padding:20px 40px 32px;border-top:1px solid rgba(0,0,0,0.07);text-align:center;">
<p style="margin:0;color:rgba(0,0,0,0.35);font-family:sans-serif;font-size:12px;">You're receiving this because you're a member of Romeo &amp; Juliet.<br/>
<a href="${APP_URL}/settings" style="color:rgba(0,0,0,0.5);">Manage notifications</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function membershipApprovedEmail(userName: string): string {
  const body = `
<p style="margin:0 0 16px;color:#2A2F28;font-size:20px;font-weight:400;">Welcome, ${userName}</p>
<p style="margin:0 0 12px;color:rgba(42,47,40,0.75);font-family:sans-serif;font-size:15px;line-height:1.7;">Your membership has been approved. You can now complete your profile and begin your introduction with Juliet.</p>
<p style="margin:0;color:rgba(42,47,40,0.75);font-family:sans-serif;font-size:15px;line-height:1.7;">We'll be in touch when we have someone worth introducing.</p>
`;
  return baseTemplate("You're in", body, "Complete your profile", `${APP_URL}/onboarding`);
}

export function membershipAppliedEmail(userName: string): string {
  const body = `
<p style="margin:0 0 16px;color:#2A2F28;font-size:20px;font-weight:400;">Thank you, ${userName}</p>
<p style="margin:0 0 12px;color:rgba(42,47,40,0.75);font-family:sans-serif;font-size:15px;line-height:1.7;">We've received your application and will review it carefully. This usually takes a few days.</p>
<p style="margin:0;color:rgba(42,47,40,0.75);font-family:sans-serif;font-size:15px;line-height:1.7;">We'll let you know when there's a decision.</p>
`;
  return baseTemplate("Application received", body, "Visit Romeo & Juliet", APP_URL);
}

export function newMatchEmail(userName: string): string {
  const body = `
<p style="margin:0 0 16px;color:#2A2F28;font-size:20px;font-weight:400;">Hello, ${userName}</p>
<p style="margin:0 0 12px;color:rgba(42,47,40,0.75);font-family:sans-serif;font-size:15px;line-height:1.7;">We have someone we'd like to introduce you to. Take a look when you have a moment — first impressions matter.</p>
`;
  return baseTemplate("A new introduction", body, "See your introduction", `${APP_URL}/home`);
}

export function matchAcceptedEmail(userName: string, matchName: string): string {
  const body = `
<p style="margin:0 0 16px;color:#2A2F28;font-size:20px;font-weight:400;">Good news, ${userName}</p>
<p style="margin:0 0 12px;color:rgba(42,47,40,0.75);font-family:sans-serif;font-size:15px;line-height:1.7;">${matchName} has accepted your introduction. You can now start a conversation.</p>
`;
  return baseTemplate("Introduction accepted", body, "Start the conversation", `${APP_URL}/chat`);
}

export function newMessageEmail(userName: string): string {
  const body = `
<p style="margin:0 0 16px;color:#2A2F28;font-size:20px;font-weight:400;">Hi ${userName},</p>
<p style="margin:0 0 12px;color:rgba(42,47,40,0.75);font-family:sans-serif;font-size:15px;line-height:1.7;">You have a new message waiting. Reply while it's still fresh.</p>
`;
  return baseTemplate("New message", body, "Read your message", `${APP_URL}/chat`);
}
