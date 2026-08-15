import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Layers,
  PieChart,
  Timer,
  Settings as SettingsIcon,
  Waves,
} from "lucide-react";
import type { ReactNode } from "react";
import { useRenewise } from "@/lib/renewise-store";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/subscriptions", label: "Subscriptions", icon: Layers },
  { to: "/analytics", label: "Analytics", icon: PieChart },
  { to: "/trials", label: "Trial Shark", icon: Timer },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { email, connected } = useRenewise();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="glass sticky top-0 z-30 flex items-center gap-2 overflow-x-auto px-4 py-3 lg:h-screen lg:w-64 lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible lg:px-4 lg:py-6">
        <Link to="/" className="mb-0 flex items-center gap-2 pr-4 lg:mb-8 lg:px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-[image:var(--gradient-mint)] text-primary-foreground">
            <Waves className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Renewise</span>
        </Link>

        {nav.map(({ to, label, icon: Icon }) => {
          const active = path === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}

        <div className="mt-auto hidden rounded-2xl border border-border/70 bg-surface-2/60 p-3 lg:block">
          <p className="text-xs text-muted-foreground">
            {connected ? "Gmail connected" : "Not connected"}
          </p>
          <p className="truncate text-sm font-medium">{email || "guest@renewise.app"}</p>
        </div>
      </aside>

      <main className="flex-1 px-4 pb-16 pt-6 sm:px-8 lg:px-10">
        <header className="mb-8 animate-float-up">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </header>
        {children}
      </main>
    </div>
  );
}
