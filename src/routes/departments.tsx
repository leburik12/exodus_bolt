import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Building2, Users, Activity, AlertTriangle, Calendar, CheckSquare, ArrowRight, Filter } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { departments, type Department } from "@/lib/departments-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Department Operations // Zetseat" },
      { name: "description", content: "Department & ministry registry, KPIs, agendas, sessions and tasks." },
    ],
  }),
  component: DepartmentsPage,
});

const accentBg: Record<string, string> = {
  amber: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  rose: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  sky: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  violet: "bg-violet-500/10 text-violet-600 border-violet-500/30",
};

function DepartmentsPage() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("");

  const categories = useMemo(() => {
    const m = new Map<string, { en: string; am: string }>();
    departments.forEach((d) => m.set(d.category.en, d.category));
    return Array.from(m.values());
  }, []);

  const filtered = useMemo(() => {
    return departments.filter((d) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q ||
        d.name.en.toLowerCase().includes(q) || d.name.am.includes(q) ||
        d.leader.toLowerCase().includes(q) ||
        d.category.en.toLowerCase().includes(q);
      const matchC = !cat || d.category.en === cat;
      return matchQ && matchC;
    });
  }, [query, cat]);

  const totalMembers = departments.reduce((a, b) => a + b.members, 0);
  const pending = departments.reduce((a, b) => a + b.pendingAgendas, 0);
  const upcoming = departments.reduce((a, b) => a + b.upcomingSessions, 0);
  const avgHealth = Math.round(departments.reduce((a, b) => a + b.health, 0) / departments.length);

  return (
    <AppShell>
      <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
        {/* Header */}
        <header className="flex items-end justify-between border-b border-border pb-4">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">DPT · Registry</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{t("dp.title")}</h1>
            <p className="mono mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">{t("dp.subtitle")}</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <Stat code="MBR" label={t("ps.totalMembers")} value={totalMembers.toLocaleString()} />
            <Stat code="ACT" label={t("ps.activeDept")} value={String(departments.length)} />
            <Stat code="PND" label={t("dp.pending")} value={String(pending)} tone="amber" />
            <Stat code="HLT" label={t("ps.health")} value={`${avgHealth}%`} tone="emerald" />
          </div>
        </header>

        {/* Filter bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("dp.search")}
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm outline-none focus:border-foreground/30"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1">
            <Filter className="h-3 w-3 text-muted-foreground" />
            <button
              onClick={() => setCat("")}
              className={`mono px-2 py-1 text-[10px] uppercase tracking-wider rounded ${!cat ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >{t("dp.all")}</button>
            {categories.map((c) => (
              <button
                key={c.en}
                onClick={() => setCat(c.en)}
                className={`mono px-2 py-1 text-[10px] uppercase tracking-wider rounded ${cat === c.en ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >{c[lang]}</button>
            ))}
          </div>
          <div className="mono rounded-md border border-border px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {filtered.length}/{departments.length}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => <DeptCard key={d.id} d={d} lang={lang} t={t} />)}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ code, label, value, tone }: { code: string; label: string; value: string; tone?: "amber" | "emerald" }) {
  const toneClass = tone === "amber" ? "text-amber-600" : tone === "emerald" ? "text-emerald-600" : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2">
      <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{code} · {label}</div>
      <div className={`mt-0.5 text-base font-semibold tabular-nums ${toneClass}`}>{value}</div>
    </div>
  );
}

function DeptCard({ d, lang, t }: { d: Department; lang: "en" | "am"; t: (k: string) => string }) {
  return (
    <Link
      to="/departments/$deptId"
      params={{ deptId: d.id }}
      className="group flex flex-col gap-3 rounded-md border border-border bg-surface p-4 transition-colors hover:border-foreground/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{d.code} · {d.category[lang]}</div>
          <div className="mt-0.5 text-base font-semibold leading-tight">{d.name[lang]}</div>
        </div>
        <span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${accentBg[d.accent]}`}>
          <Building2 className="mr-1 inline h-2.5 w-2.5" />{d.status}
        </span>
      </div>

      <p className="line-clamp-2 text-xs text-muted-foreground">{d.mission[lang]}</p>

      <div className="grid grid-cols-3 gap-2">
        <Mini label={t("dp.health")} value={`${d.health}%`} icon={Activity} tone={d.health >= 85 ? "emerald" : "amber"} />
        <Mini label={t("dp.attendance")} value={`${d.attendance}%`} icon={Users} />
        <Mini label={t("dp.members")} value={`${d.members}`} icon={Users} />
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border pt-2.5">
        <Mini label={t("dp.pending")} value={String(d.pendingAgendas)} icon={AlertTriangle} tone={d.pendingAgendas > 0 ? "amber" : undefined} dense />
        <Mini label={t("dp.upcoming")} value={String(d.upcomingSessions)} icon={Calendar} dense />
        <Mini label={t("dp.tasks")} value={String(d.openTasks)} icon={CheckSquare} dense />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-2.5">
        <div className="min-w-0">
          <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{t("dp.leader")}</div>
          <div className="truncate text-xs font-medium">{d.leader}</div>
        </div>
        <span className="mono inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
          {t("dp.open")} <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

function Mini({ label, value, icon: Icon, tone, dense }: { label: string; value: string; icon: typeof Activity; tone?: "emerald" | "amber"; dense?: boolean }) {
  const c = tone === "emerald" ? "text-emerald-600" : tone === "amber" ? "text-amber-600" : "text-foreground";
  return (
    <div className={`rounded border border-border bg-background ${dense ? "px-2 py-1" : "px-2 py-1.5"}`}>
      <div className="mono flex items-center gap-1 text-[8.5px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />{label}
      </div>
      <div className={`text-sm font-semibold tabular-nums ${c}`}>{value}</div>
    </div>
  );
}
