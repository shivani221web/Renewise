import { createFileRoute } from "@tanstack/react-router";

/**
 * Daily cron endpoint: finds subscriptions renewing within each user's chosen
 * lead-day windows and sends email / SMS reminders before the bank is charged.
 */
export const Route = createFileRoute("/api/public/hooks/renewal-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        if (!apikey || apikey !== process.env["SUPABASE_PUBLISHABLE_KEY"]) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { sendEmail, sendSms, renewalEmailHtml, renewalSmsText } = await import(
          "@/lib/messaging.server"
        );

        const today = new Date();
        const iso = (d: number) => {
          const t = new Date(today);
          t.setUTCDate(t.getUTCDate() + d);
          return t.toISOString().slice(0, 10);
        };
        const horizon = iso(30);

        const { data: subs, error } = await supabaseAdmin
          .from("subscriptions")
          .select("id, user_id, merchant, amount, currency, renewal_date, trial, manage_url")
          .eq("active", true)
          .gte("renewal_date", iso(0))
          .lte("renewal_date", horizon);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        const userIds = [...new Set((subs ?? []).map((s) => s.user_id))];
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id, email, phone, email_alerts, sms_alerts, lead_days")
          .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

        const byUser = new Map((profiles ?? []).map((p) => [p.id, p]));
        let sent = 0;
        const failures: string[] = [];

        for (const sub of subs ?? []) {
          const profile = byUser.get(sub.user_id);
          if (!profile) continue;
          const days = Math.round(
            (new Date(sub.renewal_date + "T00:00:00Z").getTime() -
              new Date(iso(0) + "T00:00:00Z").getTime()) /
              86400000,
          );
          if (!(profile.lead_days ?? []).includes(days)) continue;

          const channels: ("email" | "sms")[] = [];
          if (profile.email_alerts && profile.email) channels.push("email");
          if (profile.sms_alerts && profile.phone) channels.push("sms");

          for (const channel of channels) {
            const { data: already } = await supabaseAdmin
              .from("alerts_sent")
              .select("id")
              .eq("subscription_id", sub.id)
              .eq("channel", channel)
              .eq("lead_days", days)
              .eq("renewal_date", sub.renewal_date)
              .maybeSingle();
            if (already) continue;

            const payload = {
              merchant: sub.merchant,
              amount: Number(sub.amount),
              currency: sub.currency,
              renewalDate: sub.renewal_date,
              days,
              manageUrl: sub.manage_url,
              trial: sub.trial,
            };

            const result =
              channel === "email"
                ? await sendEmail(
                    profile.email!,
                    `${sub.merchant} renews ${days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}`,
                    renewalEmailHtml(payload),
                  )
                : await sendSms(profile.phone!, renewalSmsText(payload));

            await supabaseAdmin.from("alerts_sent").insert({
              user_id: sub.user_id,
              subscription_id: sub.id,
              channel,
              lead_days: days,
              renewal_date: sub.renewal_date,
              status: result.ok ? "sent" : "failed",
              detail: result.detail,
            });

            if (result.ok) sent += 1;
            else failures.push(`${sub.merchant}:${channel}:${result.detail}`);
          }
        }

        return new Response(
          JSON.stringify({ ok: true, scanned: subs?.length ?? 0, sent, failures }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
