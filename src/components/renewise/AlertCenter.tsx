import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BellRing, CloudUpload, Loader2, LogOut, Send, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { useRenewise } from "@/lib/renewise-store";
import {
  getAlertSettings,
  saveAlertSettings,
  sendTestAlert,
  syncSubscriptions,
  type AlertSettings,
} from "@/lib/alerts.functions";

const LEAD_OPTIONS = [14, 7, 3, 1, 0];

export function AlertCenter() {
  const { user, loading } = useAuth();
  const { subs } = useRenewise();
  const load = useServerFn(getAlertSettings);
  const save = useServerFn(saveAlertSettings);
  const sync = useServerFn(syncSubscriptions);
  const test = useServerFn(sendTestAlert);

  const [settings, setSettings] = useState<AlertSettings>({
    email: "",
    phone: "",
    emailAlerts: true,
    smsAlerts: false,
    leadDays: [7, 3, 1],
  });
  const [syncedCount, setSyncedCount] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    load({})
      .then((res) => {
        setSettings({ ...res.settings, email: res.settings.email || user.email || "" });
        setSyncedCount(res.syncedCount);
      })
      .catch(() => toast.error("Could not load your alert settings"));
  }, [user, load]);

  if (loading) return null;

  if (!user) {
    return (
      <section className="glass rounded-3xl p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <BellRing className="size-5 text-primary" /> Real renewal alerts
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to sync your subscriptions to the cloud and get an email or SMS before any
          auto-debit hits your bank account.
        </p>
        <Link
          to="/auth"
          className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
        >
          Sign in to enable alerts
        </Link>
      </section>
    );
  }

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="glass rounded-3xl p-6 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <BellRing className="size-5 text-primary" /> Renewal alerts
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Signed in as {user.email} · {syncedCount} subscriptions synced to the cloud
          </p>
        </div>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-xs font-semibold"
        >
          <LogOut className="size-3.5" /> Sign out
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Alert email
          </span>
          <input
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            placeholder="you@gmail.com"
            className="mt-2 w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Mobile number (with country code)
          </span>
          <input
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            placeholder="+919876543210"
            className="mt-2 w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSettings({ ...settings, emailAlerts: !settings.emailAlerts })}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold ${
            settings.emailAlerts ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"
          }`}
        >
          <BellRing className="size-3.5" /> Email alerts
        </button>
        <button
          type="button"
          onClick={() => setSettings({ ...settings, smsAlerts: !settings.smsAlerts })}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold ${
            settings.smsAlerts ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"
          }`}
        >
          <Smartphone className="size-3.5" /> SMS alerts
        </button>
      </div>

      <p className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">Warn me</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {LEAD_OPTIONS.map((d) => {
          const on = settings.leadDays.includes(d);
          return (
            <button
              key={d}
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  leadDays: on
                    ? settings.leadDays.filter((x) => x !== d)
                    : [...settings.leadDays, d].sort((a, b) => b - a),
                })
              }
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                on ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {d === 0 ? "On renewal day" : `${d} days before`}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            run("save", async () => {
              await save({ data: settings });
              toast.success("Alert preferences saved");
            })
          }
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy === "save" ? <Loader2 className="size-3.5 animate-spin" /> : null} Save preferences
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            run("sync", async () => {
              const res = await sync({
                data: {
                  subs: subs.map((s) => ({
                    localId: s.id,
                    merchant: s.merchant,
                    amount: s.amount,
                    currency: s.currency,
                    frequency: s.frequency,
                    renewalDate: s.renewalDate,
                    category: s.category,
                    trial: s.trial,
                    active: s.active,
                    manageUrl: s.manageUrl,
                  })),
                },
              });
              setSyncedCount(res.synced);
              toast.success(`${res.synced} subscriptions synced for monitoring`);
            })
          }
          className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 px-4 py-2.5 text-xs font-semibold disabled:opacity-60"
        >
          {busy === "sync" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CloudUpload className="size-3.5" />
          )}
          Sync subscriptions
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            run("test", async () => {
              const res = await test({});
              const failed = res.results.filter((r) => !r.ok);
              if (!failed.length) toast.success("Test alert sent — check your inbox / phone");
              else
                toast.error(
                  failed
                    .map((f) =>
                      f.detail === "email_not_configured"
                        ? "Email sending isn't connected yet"
                        : f.detail === "sms_not_configured"
                          ? "SMS sending isn't connected yet"
                          : f.detail === "no_channel_enabled"
                            ? "Enable a channel and save first"
                            : `${f.channel}: ${f.detail}`,
                    )
                    .join(" · "),
                );
            })
          }
          className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 px-4 py-2.5 text-xs font-semibold disabled:opacity-60"
        >
          {busy === "test" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Send className="size-3.5" />
          )}
          Send test alert
        </button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        A background job runs every morning, finds anything renewing inside your chosen windows and
        sends the alert once per subscription per window.
      </p>
    </section>
  );
}
