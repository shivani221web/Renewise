import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Power, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/renewise/Shell";
import { useRenewise } from "@/lib/renewise-store";
import { daysUntil, inr, valueScore, yearlyEquivalent } from "@/lib/renewise-data";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({
    meta: [
      { title: "All Subscriptions — Renewise" },
      {
        name: "description",
        content:
          "Every recurring service Renewise found in your inbox, with amounts, renewal dates, value scores and one-tap cancel links.",
      },
      { property: "og:title", content: "All Subscriptions — Renewise" },
      {
        property: "og:description",
        content: "Manage, pause or cancel every recurring payment from one list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Subscriptions,
});

const filters = ["All", "Active", "Trials", "Paused"] as const;

function Subscriptions() {
  const { subs, toggleActive, removeSub } = useRenewise();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const list = useMemo(
    () =>
      subs
        .filter((s) => s.merchant.toLowerCase().includes(q.toLowerCase()))
        .filter((s) =>
          filter === "Active"
            ? s.active
            : filter === "Trials"
              ? s.trial
              : filter === "Paused"
                ? !s.active
                : true,
        )
        .sort((a, b) => daysUntil(a.renewalDate) - daysUntil(b.renewalDate)),
    [subs, q, filter],
  );

  return (
    <Shell title="Subscriptions" subtitle="Extracted from receipts, invoices and renewal notices.">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="glass flex flex-1 items-center gap-2 rounded-xl px-4 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search merchants…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="glass flex gap-1 rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => {
          const d = daysUntil(s.renewalDate);
          const score = valueScore(s);
          return (
            <article
              key={s.id}
              className={`glass group rounded-2xl p-5 transition-transform hover:-translate-y-1 ${
                s.active ? "" : "opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="grid size-11 place-items-center rounded-xl text-sm font-bold"
                  style={{ background: `color-mix(in oklab, ${s.accent} 25%, transparent)` }}
                >
                  {s.merchant.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{s.merchant}</p>
                  <p className="text-xs text-muted-foreground">{s.category}</p>
                </div>
                {s.trial && (
                  <span className="rounded-full bg-warning/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-warning">
                    trial
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-end justify-between">
                <p className="font-display text-2xl font-bold">{inr(s.amount)}</p>
                <p className="text-xs text-muted-foreground">/{s.frequency.replace("ly", "")}</p>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={d <= 3 ? "font-semibold text-warning" : "text-muted-foreground"}>
                  Renews {new Date(s.renewalDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  · {d}d
                </span>
                <span className="text-muted-foreground">{inr(yearlyEquivalent(s))}/yr</span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${score}%`, background: s.accent }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">Value score {score}/100</p>

              <p className="mt-3 line-clamp-2 rounded-xl bg-surface-2/60 p-2 font-mono text-[11px] text-muted-foreground">
                {s.gmailSnippet}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={s.manageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-xs font-semibold hover:bg-surface-2/70"
                >
                  Manage <ExternalLink className="size-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    toggleActive(s.id);
                    toast(s.active ? `${s.merchant} paused` : `${s.merchant} reactivated`);
                  }}
                  className="grid size-9 place-items-center rounded-xl bg-surface-2 hover:text-primary"
                  aria-label="Toggle active"
                >
                  <Power className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeSub(s.id);
                    toast(`${s.merchant} removed from tracking`);
                  }}
                  className="grid size-9 place-items-center rounded-xl bg-surface-2 hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {list.length === 0 && (
        <p className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          Nothing matches that filter.
        </p>
      )}
    </Shell>
  );
}
