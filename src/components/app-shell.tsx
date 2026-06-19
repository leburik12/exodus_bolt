import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Users, Network, ScanLine, Sparkles, Command, Languages, LogOut } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import logo from "@/assets/zetseat_logo.jpg?url";
import { useI18n } from "@/lib/i18n";
import { useAuth, ROLE_LABELS } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lang, setLang, t } = useI18n();
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/auth" });
  }, [ready, user, navigate]);

  const nav = [
    { to: "/", label: t("nav.members"), code: "MBR", icon: Users },
    { to: "/cells", label: t("nav.cells"), code: "CEL", icon: Network },
    { to: "/attendance", label: t("nav.attendance"), code: "ATD", icon: ScanLine },
    { to: "/talents", label: t("nav.talents"), code: "TLT", icon: Sparkles },
  ];

  if (!ready || !user) {
    return (
      <div className="grid h-screen w-full place-items-center bg-background text-muted-foreground">
        <div className="mono text-[11px] uppercase tracking-[0.22em]">Authenticating session…</div>
      </div>
    );
  }

  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "OP";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <aside className="flex w-[68px] shrink-0 flex-col items-center border-r border-border bg-surface py-3">
        <div className="mb-4 grid h-10 w-10 place-items-center overflow-hidden rounded-md ring-1 ring-border">
          <img src={logo} alt="Zetseat" className="h-full w-full object-cover" />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={[
                  "group relative grid h-11 w-11 place-items-center rounded-md text-muted-foreground transition-colors",
                  active ? "bg-amber-soft text-foreground" : "hover:bg-muted hover:text-foreground",
                ].join(" ")}
                title={n.label}
              >
                {active && (
                  <span className="absolute -left-3 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-sm bg-amber" />
                )}
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                <span className="mono absolute left-full ml-3 z-50 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] uppercase tracking-wide text-foreground shadow-sm group-hover:block">
                  {n.code} · {n.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "am" : "en")}
            className="group relative grid h-9 w-9 place-items-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-amber-soft"
            title={lang === "en" ? "Switch to አማርኛ" : "Switch to English"}
          >
            <Languages className="h-3.5 w-3.5" />
            <span className="mono absolute -top-1 -right-1 rounded-sm bg-foreground px-1 text-[8px] font-bold uppercase text-background">
              {lang}
            </span>
          </button>
          <div
            className="group relative grid h-9 w-9 place-items-center rounded-md bg-amber text-foreground"
            title={`${user.name} · ${ROLE_LABELS[user.role][lang]}`}
          >
            <span className="mono text-[10px] font-bold tracking-wider">{initials}</span>
            <span className="mono absolute left-full ml-3 z-50 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] uppercase tracking-wide text-foreground shadow-sm group-hover:block">
              {user.name} · {ROLE_LABELS[user.role][lang]}
            </span>
          </div>
          <button
            onClick={() => { logout(); navigate({ to: "/auth" }); }}
            className="group relative grid h-9 w-9 place-items-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={lang === "en" ? "Sign out" : "ውጣ"}
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
          <div className="mono flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
            <Command className="h-3.5 w-3.5" />
            <span>K</span>
          </div>
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
