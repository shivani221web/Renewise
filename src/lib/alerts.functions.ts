import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AlertSettings = {
  email: string;
  phone: string;
  emailAlerts: boolean;
  smsAlerts: boolean;
  leadDays: number[];
};

export type SyncSub = {
  localId: string;
  merchant: string;
  amount: number;
  currency: string;
  frequency: string;
  renewalDate: string;
  category: string;
  trial: boolean;
  active: boolean;
  manageUrl: string;
};

export const getAlertSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("profiles")
      .select("email, phone, email_alerts, sms_alerts, lead_days")
      .eq("id", userId)
      .maybeSingle();

    const { count } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const { data: recent } = await supabase
      .from("alerts_sent")
      .select("channel, lead_days, renewal_date, status, detail, created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    return {
      settings: {
        email: data?.email ?? "",
        phone: data?.phone ?? "",
        emailAlerts: data?.email_alerts ?? true,
        smsAlerts: data?.sms_alerts ?? false,
        leadDays: data?.lead_days ?? [7, 3, 1],
      } as AlertSettings,
      syncedCount: count ?? 0,
      recent: recent ?? [],
    };
  });

export const saveAlertSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: AlertSettings) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email: data.email.trim(),
        phone: data.phone.trim(),
        email_alerts: data.emailAlerts,
        sms_alerts: data.smsAlerts,
        lead_days: data.leadDays.filter((d) => d >= 0 && d <= 30),
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const syncSubscriptions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { subs: SyncSub[] }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const rows = data.subs.slice(0, 200).map((s) => ({
      user_id: userId,
      local_id: s.localId,
      merchant: s.merchant,
      amount: s.amount,
      currency: s.currency,
      frequency: s.frequency,
      renewal_date: s.renewalDate,
      category: s.category,
      trial: s.trial,
      active: s.active,
      manage_url: s.manageUrl,
    }));
    const { error } = await supabase
      .from("subscriptions")
      .upsert(rows, { onConflict: "user_id,local_id" });
    if (error) throw new Error(error.message);

    const keep = rows.map((r) => r.local_id);
    if (keep.length) {
      await supabase
        .from("subscriptions")
        .delete()
        .eq("user_id", userId)
        .not("local_id", "in", `(${keep.map((k) => `"${k}"`).join(",")})`);
    }
    return { synced: rows.length };
  });

export const sendTestAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, phone, email_alerts, sms_alerts")
      .eq("id", userId)
      .maybeSingle();

    const { sendEmail, sendSms, renewalEmailHtml, renewalSmsText } = await import(
      "./messaging.server"
    );

    const demo = {
      merchant: "Spotify Premium",
      amount: 119,
      currency: "INR",
      renewalDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      days: 1,
      manageUrl: "https://www.spotify.com/account/subscription/",
    };

    const results: { channel: string; ok: boolean; detail: string }[] = [];

    if (profile?.email_alerts && profile.email) {
      const r = await sendEmail(
        profile.email,
        "Test alert · Spotify renews tomorrow (₹119)",
        renewalEmailHtml(demo),
      );
      results.push({ channel: "email", ...r });
    }
    if (profile?.sms_alerts && profile.phone) {
      const r = await sendSms(profile.phone, renewalSmsText(demo));
      results.push({ channel: "sms", ...r });
    }
    if (!results.length) results.push({ channel: "none", ok: false, detail: "no_channel_enabled" });
    return { results };
  });
