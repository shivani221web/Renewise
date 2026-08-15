import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Fish, ShieldAlert } from "lucide-react";
import { Shell } from "@/components/renewise/Shell";
import { useRenewise } from "@/lib/renewise-store";
import { daysUntil, inr, yearlyEquivalent } from "@/lib/renewise-data";

export const Route = createFileRoute("/trials")({
  head: () => ({
    meta: [
      { title: "Trial Shark — Free Trial Guard | Renewise" },
      {
        name: "description",
        content:
          "Trial Shark hunts free trials in your inbox and warns you days before they silently convert into paid subscriptions.",
      },
      { property: "og:title", content: "Trial Shark — Renewise" },
      {
        property: "og:description",
        content: "Never get charged for a forgotten free trial again.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Trials,
});

function Trials() {
  const { subs } = useRenewise();
  const trials = subs
    .filter((s) => s.trial && s.active)
    .sort((a, b) => daysUntil(a.renewalDate) - daysUntil(b.renewalDate));
  const exposure = trials.reduce((a, s) => a + yearlyEquivalent(s), 0);

  return (
    <Shell
      title="Trial Shark"
      subtitle="Free trials convert quietly. Trial Shark bites first."
    >
      <div className="glass mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-[image:var(--gradient-mint)] text-primary-foreground">
            <Fish className="size-7" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold">{trials.length} trials circling</p>
            <p className="text-sm text-muted-foreground">
              {inr(exposure)} of yearly charges if you forget to cancel
            </p>
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          {[7, 3, 1].map((d) => (
            <span key={d} className="rounded-full bg-surface-2 px-3 py-1.5 text-muted-foreground">
              alert · {d}d before
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {trials.map((s) => {
          const d = daysUntil(s.renewalDate);
          const urgency = Math.max(0, Math.min(100, 100 - (d / 30) * 100));
          return (
            <article key={s.id} className="glass relative overflow-hidden rounded-3xl p-6">
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ width: `${urgency}%`, background: "var(--gradient-mint)" }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-xl font-bold">{s.merchant}</p>
                  <p className="text-xs text-muted-foreground">{s.category}</p>
                </div>
                <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-bold text-warning">
                  {d}d left
                </span>
              </div>

              <p className="mt-4 rounded-xl bg-surface-2/60 p-3 font-mono text-[11px] text-muted-foreground">
                {s.gmailSnippet}
              </p>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Converts to</p>
                  <p className="font-display text-2xl font-bold">
                    {inr(s.amount)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      /{s.frequency.replace("ly", "")}
                    </span>
                  </p>
                </div>
                <a
                  href={s.manageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
                >
                  Cancel now <ExternalLink className="size-3.5" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {trials.length === 0 && (
        <p className="glass flex items-center gap-3 rounded-2xl p-6 text-sm text-muted-foreground">
          <ShieldAlert className="size-5 text-primary" /> No active trials detected in your inbox.
        </p>
      )}
    </Shell>
  );
}
