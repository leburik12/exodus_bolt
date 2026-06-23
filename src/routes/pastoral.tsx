import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Crown, Activity, Users, Calendar, AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, XCircle, RotateCw, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { departments, agendas, sessions } from "@/lib/departments-data";
import { members as ALL_MEMBERS } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/pastoral")({
  head: () => ({
    meta: [{ title: "Pastoral Dashboard // Zetseat" }],
  }),
  component: PastoralPage,
});

const statusTone: Record<string, string> = {
  Approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  "Under Review": "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Submitted: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  Rejected: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  "Revision Requested": "bg-violet-500/10 text-violet-600 border-violet-500/30",
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  High: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Critical: "bg-rose-500/10 text-rose-600 border-rose-500/30",
};

function PastoralPage() {
  const { t, lang } = useI18n();
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected" | "revise">>({});

  const totalMembers = ALL_MEMBERS.length + departments.reduce((a, b) => a + b.members, 0);
  const pending = agendas.filter((a) => ["Submitted", "Under Review"].includes(a.status)).length;
  const avgAtt = Math.round(departments.reduce((a, b) => a + b.attendance, 0) / departments.length);
  const avgHealth = Math.round(departments.reduce((a, b) => a + b.health, 0) / departments.length);

  const queue = useMemo(
    () => agendas.filter((a) => ["Submitted", "Under Review", "Revision Requested"].includes(a.status)),
    []
  );

  const upcoming = useMemo(
    () => sessions.filter((s) => s.status === "Scheduled").sort((a, b) => a.date.localeCompare(b.date)),
    []
  );

  const sortedDepts = [...departments].sort((a, b) => b.health - a.health);

  return (
    <AppShell>
      <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
        {/* Header */}
        <header className="flex items-end justify-between border-b border-border pb-4">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">PST · Console</div>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Crown className="h-5 w-5 text-amber-600" /> {t("ps.title")}
            </h1>
            <p className="mono mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">{t("ps.subtitle")}</p>
          </div>
          <div className="mono rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-amber-700">
            Operational · Live
          </div>
        </header>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <Kpi icon={Users} label={t("ps.totalMembers")} value={totalMembers.toLocaleString()} />
          <Kpi icon={Activity} label={t("ps.activeDept")} value={String(departments.length)} />
          <Kpi icon={AlertTriangle} label={t("ps.pendingApprovals")} value={String(pending)} tone="amber" />
          <Kpi icon={Calendar} label={t("ps.weeklyAtt")} value={`${avgAtt}%`} />
          <Kpi icon={Activity} label={t("ps.health")} value={`${avgHealth}%`} tone="emerald" />
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_1fr]">
          {/* Department performance */}
          <div className="rounded-md border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">{t("ps.deptPerf")}</div>
              <Link to="/departments" className="mono inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
                {t("dp.open")} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {sortedDepts.map((d) => (
                <Link
                  key={d.id}
                  to="/departments/$deptId"
                  params={{ deptId: d.id }}
                  className="grid grid-cols-[80px_1fr_60px_60px_60px] items-center gap-3 rounded border border-border bg-background px-2.5 py-2 text-xs transition-colors hover:border-foreground/30"
                >
                  <span className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{d.code}</span>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{d.name[lang]}</div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className={`h-full ${d.health >= 85 ? "bg-emerald-500" : d.health >= 75 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${d.health}%` }} />
                    </div>
                  </div>
                  <span className="mono text-right text-[10px] uppercase tracking-wider text-muted-foreground">{d.members}m</span>
                  <span className="mono text-right text-[10px] uppercase tracking-wider text-muted-foreground">{d.attendance}%</span>
                  <span className={`mono text-right text-[10px] font-semibold tabular-nums ${d.health >= 85 ? "text-emerald-600" : d.health >= 75 ? "text-amber-600" : "text-rose-600"}`}>{d.health}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Approval queue */}
          <div className="rounded-md border border-border bg-surface p-4">
            <div className="mono mb-3 text-[10px] uppercase tracking-wider text-muted-foreground">{t("ps.queue")}</div>
            <ul className="flex flex-col gap-2">
              {queue.map((a) => {
                const decision = decisions[a.id];
                const dept = departments.find((d) => d.id === a.dept);
                return (
                  <li key={a.id} className="rounded border border-border bg-background p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{a.id} · {dept?.name[lang]}</div>
                        <div className="mt-0.5 text-xs font-medium leading-tight">{a.topic}</div>
                        <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{a.purpose}</div>
                      </div>
                      <span className={`mono shrink-0 rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[a.priority]}`}>{a.priority}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="mono text-muted-foreground">{t("ps.budget")} · {a.budget.toLocaleString()} ETB</span>
                      {decision ? (
                        <span className={`mono rounded border px-1.5 py-0.5 uppercase ${
                          decision === "approved" ? statusTone["Approved"] : decision === "rejected" ? statusTone["Rejected"] : statusTone["Revision Requested"]
                        }`}>
                          {decision === "approved" ? t("ps.approve") : decision === "rejected" ? t("ps.reject") : t("ps.revise")}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <ActionBtn onClick={() => setDecisions((d) => ({ ...d, [a.id]: "approved" }))} icon={CheckCircle2} tone="emerald" label={t("ps.approve")} />
                          <ActionBtn onClick={() => setDecisions((d) => ({ ...d, [a.id]: "revise" }))} icon={RotateCw} tone="amber" label={t("ps.revise")} />
                          <ActionBtn onClick={() => setDecisions((d) => ({ ...d, [a.id]: "rejected" }))} icon={XCircle} tone="rose" label={t("ps.reject")} />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Upcoming sessions */}
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="mono mb-3 text-[10px] uppercase tracking-wider text-muted-foreground">{t("ps.upcoming")}</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((s) => {
              const dept = departments.find((d) => d.id === s.dept);
              return (
                <Link
                  key={s.id}
                  to="/departments/$deptId"
                  params={{ deptId: s.dept }}
                  className="rounded border border-border bg-background p-2.5 text-xs transition-colors hover:border-foreground/30"
                >
                  <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{s.id} · {dept?.code}</div>
                  <div className="mt-0.5 font-medium">{s.title}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="mono">{s.date} · {s.time}</span>
                    <span>{s.location}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Activity; label: string; value: string; tone?: "amber" | "emerald" }) {
  const c = tone === "emerald" ? "text-emerald-600" : tone === "amber" ? "text-amber-600" : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2">
      <div className="mono flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />{label}
      </div>
      <div className={`mt-0.5 text-lg font-semibold tabular-nums ${c}`}>{value}</div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, tone, onClick }: { icon: typeof CheckCircle2; label: string; tone: "emerald" | "amber" | "rose"; onClick: () => void }) {
  const c = tone === "emerald" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
    : tone === "amber" ? "border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
    : "border-rose-500/30 bg-rose-500/10 text-rose-700 hover:bg-rose-500/20";
  return (
    <button onClick={onClick} className={`mono inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider transition-colors ${c}`}>
      <Icon className="h-2.5 w-2.5" /> {label}
    </button>
  );
}
