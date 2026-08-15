import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/renewise/Shell";
import { AlertCenter } from "@/components/renewise/AlertCenter";
import { useRenewise } from "@/lib/renewise-store";
import { inr, yearlyEquivalent } from "@/lib/renewise-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Privacy — Renewise" },
      {
        name: "description",
        content:
          "Manage inbox permissions, reminder windows, CSV export and data deletion for your Renewise account.",
      },
      { property: "og:title", content: "Settings & Privacy — Renewise" },
      {
        property: "og:description",
        content: "Control permissions, reminders and your stored subscription data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-4 last:border-0">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Settings() {
  const { subs, email, permissions, connected, disconnect, setLastScan } = useRenewise();

  const exportCsv = () => {
    const rows = [
      ["merchant", "amount", "frequency", "renewalDate", "category", "yearly"],
      ...subs.map((s) => [
        s.merchant,
        String(s.amount),
        s.frequency,
        s.renewalDate,
        s.category,
        String(Math.round(yearlyEquivalent(s))),
      ]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "renewise-subscriptions.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const total = subs.filter((s) => s.active).reduce((a, s) => a + yearlyEquivalent(s), 0);

  return (
    <Shell title="Settings" subtitle="Permissions, reminders and your data.">
      <div className="grid gap-5 lg:grid-cols-2">
        <AlertCenter />
        <section className="glass rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold">Account</h2>
          <Row title="Google account" desc={connected ? email : "Not connected"}>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                connected ? "bg-primary/20 text-primary" : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {connected ? "connected" : "offline"}
            </span>
          </Row>
          <Row title="Gmail access" desc="Read-only, receipts and renewals only">
            <span className="text-xs text-muted-foreground">
              {permissions.gmail ? "granted" : "not granted"}
            </span>
          </Row>
          <Row title="Screen time" desc="Powers the value score for each app">
            <span className="text-xs text-muted-foreground">
              {permissions.screentime ? "granted" : "off"}
            </span>
          </Row>
          <Row title="Rescan inbox" desc="Look for new receipts right now">
            <button
              type="button"
              onClick={() => {
                setLastScan(new Date().toISOString());
                toast.success("Inbox rescanned — no new subscriptions found");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-xs font-semibold"
            >
              <RefreshCw className="size-3.5" /> Rescan
            </button>
          </Row>
        </section>


        <section className="glass rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold">Your data</h2>
          <Row title="Tracked services" desc={`${subs.length} records · ${inr(total)} yearly`}>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-xs font-semibold"
            >
              <Download className="size-3.5" /> Export CSV
            </button>
          </Row>
          <Row title="Disconnect & wipe" desc="Removes permissions and local records">
            <button
              type="button"
              onClick={() => {
                disconnect();
                toast("Disconnected — all local records cleared");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/15 px-3 py-2 text-xs font-semibold text-destructive"
            >
              <Trash2 className="size-3.5" /> Delete data
            </button>
          </Row>
        </section>

        <section className="glass rounded-3xl p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <ShieldCheck className="size-5 text-primary" /> Privacy promise
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Read-only inbox scope — Renewise can never send or delete mail.</li>
            <li>• Only merchant, amount, renewal date and frequency are stored.</li>
            <li>• Email bodies, attachments and contacts are discarded after parsing.</li>
            <li>• Delete everything at any time; removal is immediate.</li>
          </ul>
        </section>
      </div>
    </Shell>
  );
}
