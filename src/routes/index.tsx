import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  Mail,
  Sparkles,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { Shell } from "@/components/renewise/Shell";
import { useRenewise } from "@/lib/renewise-store";
import {
  daysUntil,
  inr,
  monthlyEquivalent,
  valueScore,
  yearlyEquivalent,
  type Subscription,
} from "@/lib/renewise-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Renewise — Subscription Radar & Renewal Dashboard" },
      {
        name: "description",
        content:
          "Renewise scans your inbox for receipts and renewals, then shows every subscription, trial and upcoming charge on one live dashboard.",
      },
      { property: "og:title", content: "Renewise — Subscription Radar" },
      {
        property: "og:description",
        content: "See every recurring charge before it hits your account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Orbit({ subs }: { subs: Subscription[] }) {
  const horizon = 60;
  const items = subs
    .filter((s) => s.active && daysUntil(s.renewalDate) <= horizon && daysUntil(s.renewalDate) >= 0)
    .sort((a, b) => daysUntil(a.renewalDate) - daysUntil(b.renewalDate));

  return (
    <div className="glass relative aspect-square w-full overflow-hidden rounded-3xl p-6">
      <div className="absolute inset-0 grid place-items-center">
        {[0.35, 0.6, 0.85].map((r) => (
          <span
            key={r}
            className="absolute rounded-full border border-border/60"
            style={{ width: `${r * 100}%`, height: `${r * 100}%` }}
          />
        ))}
        <span className="absolute size-16 rounded-full bg-primary/25 animate-pulse-ring" />
        <div className="relative z-10 text-center">
          <p className="font-display text-3xl font-bold">{items.length}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">next 60 days</p>
        </div>
      </div>

      {items.map((s, i) => {
        const d = daysUntil(s.renewalDate);
        const radius = 18 + (d / horizon) * 32; // % from centre
        const angle = (i / Math.max(items.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        return (
          <div
            key={s.id}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div
              className="grid size-11 place-items-center rounded-full border text-[11px] font-semibold transition-transform group-hover:scale-110"
              style={{
                borderColor: s.accent,
                background: `color-mix(in oklab, ${s.accent} 22%, transparent)`,
              }}
              title={`${s.merchant} • ${inr(s.amount)} in ${d}d`}
            >
              {s.merchant.slice(0, 2).toUpperCase()}
            </div>
            <p className="mt-1 w-20 -translate-x-1/2 translate-x-[22px] text-center text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {s.merchant} · {d}d
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Dashboard() {
  const { subs, connected, lastScan } = useRenewise();
  const active = useMemo(() => subs.filter((s) => s.active), [subs]);

  const monthly = active.reduce((a, s) => a + monthlyEquivalent(s), 0);
  const yearly = active.reduce((a, s) => a + yearlyEquivalent(s), 0);
  const upcoming = [...active]
    .filter((s) => daysUntil(s.renewalDate) >= 0)
    .sort((a, b) => daysUntil(a.renewalDate) - daysUntil(b.renewalDate))
    .slice(0, 6);
  const leeches = active
    .map((s) => ({ s, score: valueScore(s) }))
    .filter((x) => x.score < 45)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  const wasted = leeches.reduce((a, x) => a + yearlyEquivalent(x.s), 0);

  return (
    <Shell
      title={connected ? "Your money on autopilot" : "Welcome to Renewise"}
      subtitle={
        connected
          ? `Inbox scanned ${lastScan ? new Date(lastScan).toLocaleString() : "just now"} · ${active.length} active subscriptions tracked`
          : "Connect your inbox to discover every recurring charge hiding in your receipts."
      }
    >
      {!connected && (
        <Link
          to="/connect"
          className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-primary/10 p-5 transition-colors hover:bg-primary/15"
        >
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-primary" />
            <div>
              <p className="font-semibold">Connect Gmail & grant permissions</p>
              <p className="text-xs text-muted-foreground">
                Read-only scan. Only merchant, amount and renewal date are stored.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Start setup <ArrowUpRight className="size-4" />
          </span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={Wallet}
          label="Monthly burn"
          value={inr(monthly)}
          hint={`${active.length} active services`}
        />
        <Stat icon={CalendarClock} label="Yearly commitment" value={inr(yearly)} hint="Locked-in recurring spend" />
        <Stat
          icon={TrendingDown}
          label="Reclaimable"
          value={inr(wasted)}
          hint="Low-value subscriptions per year"
        />
        <Stat
          icon={Sparkles}
          label="Trials running"
          value={String(active.filter((s) => s.trial).length)}
          hint="Cancel before they convert"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Renewal orbit
          </h2>
          <Orbit subs={subs} />
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Charging soon
            </h2>
            <ul className="space-y-2">
              {upcoming.map((s) => {
                const d = daysUntil(s.renewalDate);
                return (
                  <li key={s.id} className="glass flex items-center gap-4 rounded-2xl p-4">
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl text-xs font-bold"
                      style={{ background: `color-mix(in oklab, ${s.accent} 25%, transparent)` }}
                    >
                      {s.merchant.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.merchant}</p>
                      <p className="text-xs text-muted-foreground">
                        {inr(s.amount)} · {s.frequency}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        d <= 3 ? "bg-warning/20 text-warning" : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      {d === 0 ? "today" : `in ${d}d`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              <AlertTriangle className="size-4 text-warning" /> Money leeches
            </h2>
            <div className="space-y-2">
              {leeches.length === 0 && (
                <p className="glass rounded-2xl p-4 text-sm text-muted-foreground">
                  Nothing wasteful detected. Your stack is lean.
                </p>
              )}
              {leeches.map(({ s, score }) => (
                <div key={s.id} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{s.merchant}</p>
                    <p className="text-xs text-muted-foreground">{inr(yearlyEquivalent(s))}/yr</p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-mint)]"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Value score {score}/100 · used {Math.round(s.usageMinutesPerWeek / 60)}h a week
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
