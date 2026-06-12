import { Link, useRouterState } from "@tanstack/react-router";
import { Users, Network, ScanLine, Sparkles, Command } from "lucide-react";
import type { ReactNode } from "react";
import logo from "@/assets/zetseat_logo.jpg.asset.json";

const nav = [
  { to: "/", label: "Members", code: "MBR", icon: Users },
  { to: "/cells", label: "Cell Matrix", code: "CEL", icon: Network },
  { to: "/attendance", label: "Attendance", code: "ATD", icon: ScanLine },
  { to: "/talents", label: "Talents", code: "TLT", icon: Sparkles },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <aside className="flex w-[68px] shrink-0 flex-col items-center border-r border-border bg-surface py-3">
        <div className="mb-4 grid h-10 w-10 place-items-center overflow-hidden rounded-md ring-1 ring-border">
          <img src={logo.url} alt="Zetseat" className="h-full w-full object-cover" />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={[
                  "group relative grid h-11 w-11 place-items-center rounded-md text-muted-foreground transition-colors",
                  active
                    ? "bg-amber-soft text-foreground"
                    : "hover:bg-muted hover:text-foreground",
                ].join(" ")}
                title={n.label}
              >
                {active && (
                  <span className="absolute -left-3 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-sm bg-amber" />
                )}
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                <span className="mono absolute left-full ml-3 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] uppercase tracking-wide text-foreground shadow-sm group-hover:block">
                  {n.code} · {n.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="mono flex flex-col items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
          <Command className="h-4 w-4" />
          <span>K</span>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}

export function Avatar({ src, alt, size = 28, className = "" }: { src: string; alt: string; size?: number; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{ height: size, width: size }}
      className={`shrink-0 rounded-full object-cover ring-1 ring-border ${className}`}
      loading="lazy"
    />
  );
}
