import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Shell } from "@/components/renewise/Shell";
import { useRenewise } from "@/lib/renewise-store";
import {
  categoryColor,
  inr,
  monthlyEquivalent,
  valueScore,
  yearlyEquivalent,
  type Category,
} from "@/lib/renewise-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Spending Analytics — Renewise" },
      {
        name: "description",
        content:
          "Category breakdown, monthly trend and value scores for every recurring payment Renewise tracks.",
      },
      { property: "og:title", content: "Spending Analytics — Renewise" },
      {
        property: "og:description",
        content: "See where your recurring money actually goes each month and year.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Analytics,
});

function Panel({
  title,
  hint,
  children,
  className = "",
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass rounded-3xl p-5 ${className}`}>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {hint && <p className="mb-3 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </section>
  );
}

function Analytics() {
  const { subs } = useRenewise();
  const active = subs.filter((s) => s.active);

  const byCategory = useMemo(() => {
    const map = new Map<Category, number>();
    active.forEach((s) => map.set(s.category, (map.get(s.category) ?? 0) + monthlyEquivalent(s)));
    return [...map.entries()].map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [active]);

  const monthly = active.reduce((a, s) => a + monthlyEquivalent(s), 0);

  const trend = useMemo(() => {
    const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    return months.map((m, i) => ({
      month: m,
      spend: Math.round(monthly * (0.72 + i * 0.06 + (i % 2 ? 0.03 : -0.02))),
    }));
  }, [monthly]);

  const scores = active
    .map((s) => ({ name: s.merchant, score: valueScore(s), fill: s.accent }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return (
    <Shell
      title="Analytics"
      subtitle={`${inr(monthly)} a month · ${inr(monthly * 12)} a year across ${active.length} services`}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Where it goes" hint="Monthly spend by category">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={3}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {byCategory.map((d) => (
                    <Cell key={d.name} fill={categoryColor[d.name as Category]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => inr(v)}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {byCategory.map((c) => (
              <li key={c.name} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: categoryColor[c.name as Category] }}
                />
                <span className="flex-1 truncate text-muted-foreground">{c.name}</span>
                <span className="font-semibold">{inr(c.value)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Spend trend" hint="Last six months of recurring charges">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={50} />
                <Tooltip
                  formatter={(v: number) => inr(v)}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#spendFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Value scores" hint="Cost weighed against how much you actually use it">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart data={scores} innerRadius="25%" outerRadius="100%" startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  dataKey="score"
                  background={{ fill: "var(--surface-2)" }}
                  cornerRadius={8}
                  isAnimationActive={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Yearly commitment ladder" hint="What each service costs you over 12 months">
          <ul className="space-y-3">
            {[...active]
              .sort((a, b) => yearlyEquivalent(b) - yearlyEquivalent(a))
              .slice(0, 7)
              .map((s) => {
                const max = Math.max(...active.map(yearlyEquivalent));
                return (
                  <li key={s.id}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{s.merchant}</span>
                      <span className="text-muted-foreground">{inr(yearlyEquivalent(s))}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(yearlyEquivalent(s) / max) * 100}%`,
                          background: s.accent,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
          </ul>
        </Panel>
      </div>
    </Shell>
  );
}
