import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Check, Mail, Shield, Smartphone, Waves } from "lucide-react";
import { toast } from "sonner";
import { useRenewise } from "@/lib/renewise-store";
import { scanKeywords } from "@/lib/renewise-data";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect Gmail & Permissions — Renewise" },
      {
        name: "description",
        content:
          "Grant read-only inbox access, notification and screen-time permissions so Renewise can find your subscriptions.",
      },
      { property: "og:title", content: "Connect your inbox — Renewise" },
      {
        property: "og:description",
        content: "Read-only Gmail scanning. Only merchant, amount and renewal date are stored.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Connect,
});

const perms = [
  {
    key: "gmail" as const,
    icon: Mail,
    title: "Gmail — read only",
    body: "Scan receipts, invoices and renewal notices. Email bodies are never stored.",
    required: true,
  },
  {
    key: "notifications" as const,
    icon: Bell,
    title: "Notifications",
    body: "Reminders 7, 3 and 1 day before each renewal, plus trial-expiry alerts.",
    required: true,
  },
  {
    key: "screentime" as const,
    icon: Smartphone,
    title: "Screen time / app usage",
    body: "Optional. Measures how much you actually use each paid app to score its value.",
    required: false,
  },
];

function Connect() {
  const navigate = useNavigate();
  const { connect } = useRenewise();
  const [email, setEmail] = useState("");
  const [granted, setGranted] = useState({ gmail: false, notifications: false, screentime: false });
  const [scanning, setScanning] = useState(false);
  const [step, setStep] = useState(0);

  const canScan = email.includes("@") && granted.gmail && granted.notifications;

  const runScan = async () => {
    setScanning(true);
    for (let i = 0; i < scanKeywords.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 260));
      setStep(i + 1);
    }
    connect(email, granted);
    toast.success("Inbox scanned — 12 recurring payments found");
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-14">
      <div className="mb-8 flex items-center gap-3 animate-float-up">
        <span className="grid size-11 place-items-center rounded-2xl bg-[image:var(--gradient-mint)] text-primary-foreground">
          <Waves className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold">Set up Renewise</h1>
          <p className="text-sm text-muted-foreground">Three permissions. Thirty seconds.</p>
        </div>
      </div>

      <label className="glass mb-4 block rounded-2xl p-5">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Google account
        </span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
          className="mt-2 w-full rounded-xl border border-input bg-surface-2 px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <div className="space-y-3">
        {perms.map(({ key, icon: Icon, title, body, required }) => {
          const on = granted[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setGranted((g) => ({ ...g, [key]: !g[key] }))}
              className={`glass flex w-full items-start gap-4 rounded-2xl p-5 text-left transition-colors ${
                on ? "border-primary/60 bg-primary/10" : "hover:bg-surface-2/70"
              }`}
            >
              <Icon className={`mt-0.5 size-5 ${on ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <p className="font-semibold">
                  {title}
                  {!required && (
                    <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      optional
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{body}</p>
              </div>
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full border ${
                  on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {on && <Check className="size-3.5" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="glass mt-4 flex items-start gap-3 rounded-2xl p-4 text-xs text-muted-foreground">
        <Shield className="mt-0.5 size-4 text-primary" />
        <p>
          Renewise stores only merchant, amount, renewal date and billing frequency. Message bodies,
          attachments and contacts never leave your inbox.
        </p>
      </div>

      {scanning ? (
        <div className="glass mt-6 rounded-2xl p-5">
          <p className="text-sm font-semibold">Scanning inbox…</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-[image:var(--gradient-mint)] transition-all duration-300"
              style={{ width: `${(step / scanKeywords.length) * 100}%` }}
            />
          </div>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            query: "{scanKeywords[Math.min(step, scanKeywords.length - 1)]}"
          </p>
        </div>
      ) : (
        <button
          type="button"
          disabled={!canScan}
          onClick={runScan}
          className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40 ring-glow"
        >
          Continue with Google & scan inbox
        </button>
      )}
    </div>
  );
}
