function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export type SendOnboardingInviteEmailParams = {
  to: string;
  inviteUrl: string;
  greetingName?: string | null;
  businessName?: string | null;
  roleLabel: string;
};

export type SendOnboardingInviteEmailResult =
  | { ok: true }
  | { ok: false; reason: "missing_api_key" | "provider_error"; message: string };

/**
 * Sends onboarding email via [Resend](https://resend.com) HTTP API.
 * Set `RESEND_API_KEY` and optionally `INVITE_EMAIL_FROM` (verified sender).
 */
export async function sendOnboardingInviteEmail(
  params: SendOnboardingInviteEmailParams,
): Promise<SendOnboardingInviteEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      reason: "missing_api_key",
      message: "RESEND_API_KEY is not set",
    };
  }

  const from =
    process.env.INVITE_EMAIL_FROM?.trim() ??
    "elev8temedia <onboarding@resend.dev>";

  const safeName = escapeHtml(params.greetingName?.trim() || "there");
  const safeRole = escapeHtml(params.roleLabel.trim());
  const safeUrl = escapeHtml(params.inviteUrl);
  const businessBlock =
    params.businessName?.trim() ?
      `<p style="margin:16px 0 0;color:#52525b;font-size:14px;line-height:1.5;">Business: <strong style="color:#18181b;">${escapeHtml(params.businessName.trim())}</strong></p>`
    : "";

  const subject = `Finish your elev8temedia ${params.roleLabel} setup`;
  const html = `<!doctype html>
<html>
  <body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#18181b;background:#fafafa;padding:24px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:24px;">
      <tr>
        <td>
          <p style="margin:0 0 12px;font-size:14px;color:#52525b;">elev8temedia · Internal Agency OS</p>
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;">Welcome, ${safeName}</h1>
          <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;">You’ve been invited to finish onboarding as <strong>${safeRole}</strong>. Set your password to activate your account.</p>
          ${businessBlock}
          <p style="margin:24px 0 12px;">
            <a href="${safeUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 18px;border-radius:10px;">Continue onboarding</a>
          </p>
          <p style="margin:0;font-size:13px;color:#71717a;word-break:break-all;">If the button doesn’t work, paste this link into your browser:<br /><a href="${safeUrl}" style="color:#2563eb;">${safeUrl}</a></p>
          <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa;">This link expires in 7 days. If you didn’t expect this message, you can ignore it.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to.trim().toLowerCase()],
      subject,
      html,
    }),
  });

  const payload = (await res.json().catch(() => ({}))) as {
    message?: string;
    name?: string;
  };

  if (!res.ok) {
    const message =
      payload?.message ??
      payload?.name ??
      `Resend request failed (${res.status})`;
    return { ok: false, reason: "provider_error", message };
  }

  return { ok: true };
}
