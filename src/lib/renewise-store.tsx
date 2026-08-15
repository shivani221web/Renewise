import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seedSubscriptions, type Subscription } from "./renewise-data";

type Permissions = { gmail: boolean; notifications: boolean; screentime: boolean };

type Store = {
  hydrated: boolean;
  connected: boolean;
  email: string;
  permissions: Permissions;
  subs: Subscription[];
  lastScan: string | null;
  connect: (email: string, permissions: Permissions) => void;
  disconnect: () => void;
  setLastScan: (v: string) => void;
  toggleActive: (id: string) => void;
  removeSub: (id: string) => void;
};

const KEY = "renewise.state.v1";
const Ctx = createContext<Store | null>(null);

export function RenewiseProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<Permissions>({
    gmail: false,
    notifications: false,
    screentime: false,
  });
  const [subs, setSubs] = useState<Subscription[]>(seedSubscriptions);
  const [lastScan, setLastScan] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setConnected(!!p.connected);
        setEmail(p.email ?? "");
        if (p.permissions) setPermissions(p.permissions);
        if (Array.isArray(p.subs) && p.subs.length) setSubs(p.subs);
        setLastScan(p.lastScan ?? null);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ connected, email, permissions, subs, lastScan }));
  }, [hydrated, connected, email, permissions, subs, lastScan]);

  const value = useMemo<Store>(
    () => ({
      hydrated,
      connected,
      email,
      permissions,
      subs,
      lastScan,
      connect: (e, p) => {
        setEmail(e);
        setPermissions(p);
        setConnected(true);
        setLastScan(new Date().toISOString());
      },
      disconnect: () => {
        setConnected(false);
        setEmail("");
        setPermissions({ gmail: false, notifications: false, screentime: false });
        setSubs(seedSubscriptions);
        setLastScan(null);
      },
      setLastScan,
      toggleActive: (id) =>
        setSubs((cur) => cur.map((s) => (s.id === id ? { ...s, active: !s.active } : s))),
      removeSub: (id) => setSubs((cur) => cur.filter((s) => s.id !== id)),
    }),
    [hydrated, connected, email, permissions, subs, lastScan],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRenewise() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRenewise must be used inside RenewiseProvider");
  return ctx;
}
