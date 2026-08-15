/** Server-only delivery helpers for renewal alerts (email via Resend, SMS via Twilio). */

export type DeliveryResult = { ok: boolean; detail: string };

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<DeliveryResult> {
  const key = process.env["RESEND_API_KEY"];
  const from = process.env["ALERT_FROM_EMAIL"] ?? "Renewise <onboarding@resend.dev>";
  if (!key) return { ok: false, detail: "email_not_configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  const body = await res.text();
  return { ok: res.ok, detail: res.ok ? "sent" : `email_error:${res.status}:${body.slice(0, 200)}` };
}

export async function sendSms(to: string, body: string): Promise<DeliveryResult> {
  const sid = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  const from = process.env["TWILIO_PHONE_NUMBER"];
  if (!sid || !token || !from) return { ok: false, detail: "sms_not_configured" };

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });
  const text = await res.text();
  return { ok: res.ok, detail: res.ok ? "sent" : `sms_error:${res.status}:${text.slice(0, 200)}` };
}

export function renewalEmailHtml(opts: {
  merchant: string;
  amount: number;
  currency: string;
  renewalDate: string;
  days: number;
  manageUrl?: string | null;
  trial?: boolean;
}) {
  const money = `${opts.currency === "INR" ? "₹" : opts.currency + " "}${Math.round(opts.amount).toLocaleString("en-IN")}`;
  const when =
    opts.days === 0 ? "today" : opts.days === 1 ? "tomorrow" : `in ${opts.days} days`;
  return `<!doctype html><html><body style="margin:0;background:#070b12;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:28px">
  <div style="max-width:520px;margin:auto;background:#0d1420;border:1px solid #1b2536;border-radius:20px;overflow:hidden;border-color:#1b2536">
    <div style="padding:22px 24px;background:linear-gradient(120deg,#0f766e,#10b981)">
      <p style="margin:0;color:#ecfdf5;font-size:13px;letter-spacing:.18em;text-transform:uppercase">Renewise</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:22px">${opts.trial ? "Trial converts" : "Auto-debit"} ${when}</h1>
    </div>
    <div style="padding:24px;color:#c9d4e5">
      <p style="margin:0 0 6px;font-size:15px">Your bank account will be charged for:</p>
      <p style="margin:0;font-size:26px;font-weight:700;color:#fff">${opts.merchant} · ${money}</p>
      <p style="margin:8px 0 20px;font-size:13px;color:#8b9ab1">Renewal date: ${opts.renewalDate}</p>
      ${
        opts.manageUrl
          ? `<a href="${opts.manageUrl}" style="display:inline-block;background:#10b981;color:#04140f;font-weight:700;padding:12px 20px;border-radius:12px;text-decoration:none">Manage or cancel</a>`
          : ""
      }
      <p style="margin:22px 0 0;font-size:12px;color:#6f7f96">You are receiving this because renewal alerts are enabled in Renewise settings.</p>
    </div>
  </div></body></html>`;
}

export function renewalSmsText(opts: {
  merchant: string;
  amount: number;
  currency: string;
  days: number;
}) {
  const money = `${opts.currency === "INR" ? "Rs." : opts.currency + " "}${Math.round(opts.amount)}`;
  const when = opts.days === 0 ? "today" : opts.days === 1 ? "tomorrow" : `in ${opts.days} days`;
  return `Renewise: ${opts.merchant} ${money} auto-debits ${when}. Cancel now if you don't need it.`;
}
