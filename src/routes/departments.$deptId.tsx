import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Activity, Users, Calendar, AlertTriangle, CheckSquare, TrendingUp, TrendingDown, Target, Eye, Compass, UserCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getDepartment, sessions, agendas, tasks } from "@/lib/departments-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/departments/$deptId")({
  head: ({ params }) => ({
    meta: [{ title: `Department · ${params.deptId} // Zetseat` }],
  }),
  component: DepartmentDetail,
});

const statusTone: Record<string, string> = {
  Approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  "Under Review": "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Submitted: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  Rejected: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  "Revision Requested": "bg-violet-500/10 text-violet-600 border-violet-500/30",
  Draft: "bg-muted text-muted-foreground border-border",
  Scheduled: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  Cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  Pending: "bg-muted text-muted-foreground border-border",
  "In Progress": "bg-sky-500/10 text-sky-600 border-sky-500/30",
  Delayed: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  High: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Critical: "bg-rose-500/10 text-rose-600 border-rose-500/30",
};

function DepartmentDetail() {
  const { deptId } = useParams({ from: "/departments/$deptId" });
  const { t, lang } = useI18n();
  const d = getDepartment(deptId);
  const [tab, setTab] = useState<"overview" | "kpis" | "sessions" | "agendas" | "tasks">("overview");

  const deptSessions = useMemo(() => sessions.filter((s) => s.dept === deptId), [deptId]);
  const deptAgendas = useMemo(() => agendas.filter((a) => a.dept === deptId), [deptId]);
  const deptTasks = useMemo(() => tasks.filter((tk) => tk.dept === deptId), [deptId]);

  if (!d) {
    return (
      <AppShell>
        <div className="grid h-full place-items-center text-sm text-muted-foreground">Department not found.</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
        <Link to="/departments" className="mono inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> {t("dp.back")}
        </Link>

        {/* Header */}
        <header className="grid grid-cols-1 gap-3 border-b border-border pb-4 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{d.code} · {d.category[lang]}</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{d.name[lang]}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{d.description[lang]}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
              <Pill icon={Compass} label={t("dp.mission")} value={d.mission[lang]} />
              <Pill icon={Eye} label={t("dp.vision")} value={d.vision[lang]} />
              <Pill icon={Calendar} label={t("dp.cadence")} value={d.meetingFrequency[lang]} />
              <Pill icon={UserCheck} label={t("dp.pastor")} value={d.pastorSupervisor} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            <LeadCard label={t("dp.leader")} name={d.leader} />
            <LeadCard label={t("dp.assistant")} name={d.assistantLeader} />
            <LeadCard label={t("dp.secretary")} name={d.secretary} />
          </div>
        </header>

        {/* KPIs strip */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
          <Headline label={t("dp.health")} value={`${d.health}%`} icon={Activity} tone={d.health >= 85 ? "emerald" : "amber"} />
          <Headline label={t("dp.attendance")} value={`${d.attendance}%`} icon={Users} />
          <Headline label={t("dp.members")} value={`${d.members}/${d.maxMembers}`} icon={Users} />
          <Headline label={t("dp.pending")} value={String(d.pendingAgendas)} icon={AlertTriangle} tone={d.pendingAgendas > 0 ? "amber" : undefined} />
          <Headline label={t("dp.upcoming")} value={String(d.upcomingSessions)} icon={Calendar} />
          <Headline label={t("dp.tasks")} value={String(d.openTasks)} icon={CheckSquare} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {([
            ["overview", t("dp.overview")],
            ["kpis", t("dp.kpis")],
            ["sessions", t("dp.sessions")],
            ["agendas", t("dp.agendas")],
            ["tasks", t("dp.tasksTab")],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`mono px-3 py-2 text-[10px] uppercase tracking-wider transition-colors ${
                tab === k ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >{label}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card title={t("dp.kpis")}>
              <ul className="divide-y divide-border">
                {d.kpis.slice(0, 4).map((kp) => (
                  <li key={kp.key} className="flex items-center justify-between py-2">
                    <div className="text-xs">{kp.label[lang]}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">{kp.value.toLocaleString()}{kp.unit ? ` ${kp.unit}` : ""}</span>
                      <TrendChip trend={kp.trend} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title={t("dp.upcoming")}>
              <ul className="divide-y divide-border">
                {deptSessions.slice(0, 4).map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.date} · {s.time} · {s.location}</div>
                    </div>
                    <span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[s.status]}`}>{s.status}</span>
                  </li>
                ))}
                {deptSessions.length === 0 && <li className="py-3 text-xs text-muted-foreground">—</li>}
              </ul>
            </Card>
          </div>
        )}

        {tab === "kpis" && (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {d.kpis.map((kp) => (
              <div key={kp.key} className="rounded-md border border-border bg-surface p-3">
                <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{kp.label[lang]}</div>
                <div className="mt-1 flex items-end justify-between">
                  <div className="text-2xl font-semibold tabular-nums">{kp.value.toLocaleString()}{kp.unit ? <span className="ml-1 text-xs text-muted-foreground">{kp.unit}</span> : null}</div>
                  <TrendChip trend={kp.trend} />
                </div>
                <div className="mono mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">{t("dp.trend")}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "sessions" && (
          <Card>
            <Table headers={["ID", "Title", "Type", "Date", "Lead", "Status"]}>
              {deptSessions.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <Td mono>{s.id}</Td>
                  <Td>{s.title}</Td>
                  <Td muted>{s.type}</Td>
                  <Td mono>{s.date} · {s.time}</Td>
                  <Td muted>{s.lead}</Td>
                  <Td><span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[s.status]}`}>{s.status}</span></Td>
                </tr>
              ))}
            </Table>
          </Card>
        )}

        {tab === "agendas" && (
          <Card>
            <Table headers={["ID", "Topic", "Priority", "Budget", "Submitted", "Status"]}>
              {deptAgendas.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <Td mono>{a.id}</Td>
                  <Td>{a.topic}</Td>
                  <Td><span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[a.priority]}`}>{a.priority}</span></Td>
                  <Td mono>{a.budget.toLocaleString()} ETB</Td>
                  <Td muted>{a.submittedBy} · {a.submittedAt}</Td>
                  <Td><span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[a.status]}`}>{a.status}</span></Td>
                </tr>
              ))}
              {deptAgendas.length === 0 && <tr><Td muted>—</Td></tr>}
            </Table>
          </Card>
        )}

        {tab === "tasks" && (
          <Card>
            <Table headers={["ID", "Task", "Assignee", "Due", "Priority", "Status"]}>
              {deptTasks.map((tk) => (
                <tr key={tk.id} className="border-t border-border">
                  <Td mono>{tk.id}</Td>
                  <Td>{tk.title}</Td>
                  <Td muted>{tk.assignedTo}</Td>
                  <Td mono>{tk.due}</Td>
                  <Td><span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[tk.priority]}`}>{tk.priority}</span></Td>
                  <Td><span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[tk.status]}`}>{tk.status}</span></Td>
                </tr>
              ))}
              {deptTasks.length === 0 && <tr><Td muted>—</Td></tr>}
            </Table>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function Pill({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface px-2.5 py-1.5">
      <div className="mono flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />{label}
      </div>
      <div className="mt-0.5 line-clamp-2 text-[11px] leading-tight">{value}</div>
    </div>
  );
}

function LeadCard({ label, name }: { label: string; name: string }) {
  const init = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-amber text-foreground">
        <span className="mono text-[10px] font-bold">{init}</span>
      </div>
      <div className="min-w-0">
        <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-xs font-medium">{name}</div>
      </div>
    </div>
  );
}

function Headline({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Activity; tone?: "amber" | "emerald" }) {
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

function TrendChip({ trend }: { trend: number }) {
  const up = trend >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`mono inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${up ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-rose-500/30 bg-rose-500/10 text-rose-600"}`}>
      <Icon className="h-2.5 w-2.5" />{up ? "+" : ""}{trend}
    </span>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      {title && <div className="mono mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>}
      {children}
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="mono px-2 py-1.5 text-left text-[9px] uppercase tracking-wider text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, mono, muted }: { children: React.ReactNode; mono?: boolean; muted?: boolean }) {
  return <td className={`px-2 py-2 ${mono ? "mono text-[10px] uppercase tracking-wider" : ""} ${muted ? "text-muted-foreground" : ""}`}>{children}</td>;
}
