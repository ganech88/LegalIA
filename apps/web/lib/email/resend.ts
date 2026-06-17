/**
 * Cliente mínimo de Resend (envío de email) vía REST, sin SDK.
 * Requiere RESEND_API_KEY y EMAIL_FROM (ej: "LegalIA <avisos@tudominio.com.ar>").
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email no configurado (RESEND_API_KEY / EMAIL_FROM)." };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, error: `Resend ${res.status}: ${detail.slice(0, 200)}` };
  }
  return { ok: true };
}
