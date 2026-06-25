import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState, useCallback } from "react";
import {
  ArrowLeft, Activity, Users, Calendar, AlertTriangle, CheckSquare,
  TrendingUp, TrendingDown, Target, Eye, Compass, UserCheck,
  Plus, FileText, Send, Package, Upload, Download, ClipboardList,
  GitBranch, Sparkles, Megaphone, ShieldCheck, Clock, BarChart3,
  Image as ImageIcon, Video as VideoIcon, File as FileIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import {
  getDepartment, sessions, agendas, tasks,
  getDeptMembers, getDeptPlans, getDeptAttendance,
  getDeptResourceRequests, getDeptDocuments, getDeptActivity,
} from "@/lib/departments-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/departments/$deptId")({
  head: ({ params }) => ({
    meta: [{ title: `Department · ${params.deptId} // Zetseat` }],
  }),
  component: DepartmentDetail,
});

type Tab =
  | "overview" | "planning" | "members" | "sessions"
  | "attendance" | "tasks" | "agendas" | "resources"
  | "documents" | "activity" | "analytics";

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
  Active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  Archived: "bg-muted text-muted-foreground border-border",
  Probation: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  High: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Critical: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  Present: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  Late: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  Absent: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  Excused: "bg-sky-500/10 text-sky-600 border-sky-500/30",
};

function DepartmentDetail() {
  const { deptId } = useParams({ from: "/departments/$deptId" });
  const { t, lang } = useI18n();
  const d = getDepartment(deptId);
  const [tab, setTab] = useState<Tab>("overview");

  const deptSessions = useMemo(() => sessions.filter((s) => s.dept === deptId), [deptId]);
  const deptAgendas = useMemo(() => agendas.filter((a) => a.dept === deptId), [deptId]);
  const deptTasks = useMemo(() => tasks.filter((tk) => tk.dept === deptId), [deptId]);
  const deptMembers = useMemo(() => (d ? getDeptMembers(d.id) : []), [d]);
  const deptPlans = useMemo(() => (d ? getDeptPlans(d.id) : []), [d]);
  const deptAttendance = useMemo(() => (d ? getDeptAttendance(d.id) : []), [d]);
  const deptResources = useMemo(() => (d ? getDeptResourceRequests(d.id) : []), [d]);
  const deptDocs = useMemo(() => (d ? getDeptDocuments(d.id) : []), [d]);
  const deptActivity = useMemo(() => (d ? getDeptActivity(d.id) : []), [d]);

  const fire = useCallback((label: string) => toast.success(`${label} · ${t("dw.toastCreated")}`), [t]);

  if (!d) {
    return (
      <AppShell>
        <div className="grid h-full place-items-center text-sm text-muted-foreground">Department not found.</div>
      </AppShell>
    );
  }

  const tabs: [Tab, string, typeof Activity][] = [
    ["overview", t("dw.tab.overview"), Activity],
    ["planning", t("dw.tab.planning"), Target],
    ["members", t("dw.tab.members"), Users],
    ["sessions", t("dw.tab.sessions"), Calendar],
    ["attendance", t("dw.tab.attendance"), UserCheck],
    ["tasks", t("dw.tab.tasks"), CheckSquare],
    ["agendas", t("dw.tab.agendas"), ClipboardList],
    ["resources", t("dw.tab.resources"), Package],
    ["documents", t("dw.tab.documents"), FileText],
    ["activity", t("dw.tab.activity"), GitBranch],
    ["analytics", t("dw.tab.analytics"), BarChart3],
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
        <Link to="/departments" className="mono inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> {t("dp.back")}
        </Link>

        {/* Header */}
        <header className="grid grid-cols-1 gap-3 border-b border-border pb-4 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface mono text-xs font-bold">{d.code}</div>
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{d.code} · {d.category[lang]} · {d.status}</div>
                <h1 className="text-2xl font-semibold tracking-tight leading-tight">{d.name[lang]}</h1>
              </div>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{d.description[lang]}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
              <Pill icon={Compass} label={t("dp.mission")} value={d.mission[lang]} />
              <Pill icon={Eye} label={t("dp.vision")} value={d.vision[lang]} />
              <Pill icon={Calendar} label={t("dp.cadence")} value={d.meetingFrequency[lang]} />
              <Pill icon={Clock} label={t("dw.created")} value={d.createdAt} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            <LeadCard label={t("dp.pastor")} name={d.pastorSupervisor} />
            <LeadCard label={t("dp.leader")} name={d.leader} />
            <LeadCard label={t("dp.assistant")} name={d.assistantLeader} />
            <LeadCard label={t("dp.secretary")} name={d.secretary} />
          </div>
        </header>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <ActionBtn icon={Sparkles} label={t("dw.editDept")} onClick={() => fire(t("dw.editDept"))} />
          <ActionBtn icon={Plus} label={t("dw.addMember")} onClick={() => fire(t("dw.addMember"))} />
          <ActionBtn icon={Calendar} label={t("dw.createSession")} onClick={() => fire(t("dw.createSession"))} />
          <ActionBtn icon={CheckSquare} label={t("dw.createTask")} onClick={() => fire(t("dw.createTask"))} />
          <ActionBtn icon={Send} label={t("dw.submitAgenda")} onClick={() => fire(t("dw.submitAgenda"))} />
          <ActionBtn icon={Package} label={t("dw.requestResources")} onClick={() => fire(t("dw.requestResources"))} />
        </div>

        {/* Headline KPIs */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
          <Headline label={t("dp.health")} value={`${d.health}%`} icon={Activity} tone={d.health >= 85 ? "emerald" : "amber"} />
          <Headline label={t("dp.attendance")} value={`${d.attendance}%`} icon={Users} />
          <Headline label={t("dp.members")} value={`${d.members}/${d.maxMembers}`} icon={Users} />
          <Headline label={t("dp.pending")} value={String(d.pendingAgendas)} icon={AlertTriangle} tone={d.pendingAgendas > 0 ? "amber" : undefined} />
          <Headline label={t("dp.upcoming")} value={String(d.upcomingSessions)} icon={Calendar} />
          <Headline label={t("dp.tasks")} value={String(d.openTasks)} icon={CheckSquare} />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-border overflow-x-auto">
          {tabs.map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`mono inline-flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap ${
                tab === k ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            ><Icon className="h-3 w-3" />{label}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card title={t("dp.kpis")}>
              <ul className="divide-y divide-border">
                {d.kpis.slice(0, 5).map((kp) => (
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
            <Card title={t("dw.activityTimeline")}>
              <ul className="divide-y divide-border">
                {deptActivity.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-start gap-2 py-2 text-xs">
                    <Megaphone className="mt-0.5 h-3 w-3 text-muted-foreground" />
                    <div className="flex-1">
                      <div>{a.action[lang]}</div>
                      <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">{a.at} · {a.actor}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title={t("dw.resourceQueue")}>
              <ul className="divide-y divide-border">
                {deptResources.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <div className="font-medium">{r.type[lang]}</div>
                      <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">{r.amount.toLocaleString()} ETB · {r.submittedBy}</div>
                    </div>
                    <span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[r.status]}`}>{r.status}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {tab === "planning" && (
          <div className="flex flex-col gap-3">
            {deptPlans.map((p) => (
              <Card key={p.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{p.id} · {p.startDate} → {p.endDate}</div>
                    <div className="text-sm font-semibold">{p.title[lang]}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{p.description[lang]}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[p.priority]}`}>{p.priority}</span>
                    <span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[p.status]}`}>{p.status}</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                  <Mini label={t("dw.planGoal")} value={p.goal[lang]} />
                  <Mini label={t("dw.planOwner")} value={p.owner} />
                  <ProgressBar label={t("dw.planProgress")} value={p.progress} />
                </div>
                <div className="mt-3 border-t border-border pt-2.5">
                  <div className="mono mb-1.5 text-[9px] uppercase tracking-wider text-muted-foreground">{t("dw.objectives")}</div>
                  <ul className="divide-y divide-border">
                    {p.objectives.map((o) => (
                      <li key={o.id} className="flex items-center justify-between gap-3 py-1.5 text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{o.title[lang]}</div>
                          <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">{o.owner} · {t("dw.due")} {o.due}</div>
                        </div>
                        <div className="w-32 shrink-0">
                          <ProgressBar value={o.progress} compact />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "members" && (
          <Card title={t("dw.memberRoster")}>
            <Table headers={["#", t("att.member"), t("dw.role"), t("dw.skills"), t("dw.joined"), t("dw.attRate"), t("dw.status")]}>
              {deptMembers.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <Td mono>{m.id}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-amber text-foreground mono text-[9px] font-bold">{m.initials}</div>
                      <span>{m.name}</span>
                    </div>
                  </Td>
                  <Td muted>{m.role}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {m.skills.map((s) => <span key={s} className="mono rounded border border-border bg-background px-1 py-0.5 text-[9px] uppercase">{s}</span>)}
                    </div>
                  </Td>
                  <Td mono>{m.joinDate}</Td>
                  <Td mono>{m.attendanceRate}%</Td>
                  <Td><span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[m.status]}`}>{m.status}</span></Td>
                </tr>
              ))}
            </Table>
          </Card>
        )}

        {tab === "sessions" && (
          <Card>
            <Table headers={["ID", "Title", "Type", "Date", "Lead", t("dw.status")]}>
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
              {deptSessions.length === 0 && <tr><Td muted>—</Td></tr>}
            </Table>
          </Card>
        )}

        {tab === "attendance" && (
          <Card title={t("dw.attLog")}>
            <div className="mb-2 flex items-center gap-1.5">
              <ActionBtn icon={Plus} label={t("dw.bulkEntry")} onClick={() => fire(t("dw.bulkEntry"))} />
              <ActionBtn icon={Download} label={t("dw.exportCsv")} onClick={() => fire(t("dw.exportCsv"))} />
              <span className="mono ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> reusable attendance service
              </span>
            </div>
            <Table headers={[t("dw.refType"), t("dw.refId"), t("att.member"), t("dw.checkIn"), t("dw.method"), t("dw.status")]}>
              {deptAttendance.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <Td muted>{a.referenceType}</Td>
                  <Td mono>{a.referenceId}</Td>
                  <Td>{a.memberName}</Td>
                  <Td mono>{a.checkIn}</Td>
                  <Td muted>{a.method}</Td>
                  <Td><span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[a.status]}`}>{a.status}</span></Td>
                </tr>
              ))}
            </Table>
          </Card>
        )}

        {tab === "tasks" && (
          <Card>
            <Table headers={["ID", "Task", t("dw.assignee"), t("dw.due"), t("dw.priority"), t("dw.status")]}>
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

        {tab === "agendas" && (
          <Card>
            <Table headers={["ID", "Topic", t("dw.priority"), t("ps.budget"), "Submitted", t("dw.status")]}>
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

        {tab === "resources" && (
          <Card title={t("dw.resourceQueue")}>
            <Table headers={["ID", "Type", t("dw.amount"), t("dw.reason"), t("dw.attachments"), t("dw.status")]}>
              {deptResources.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <Td mono>{r.id}</Td>
                  <Td>{r.type[lang]}</Td>
                  <Td mono>{r.amount.toLocaleString()} ETB</Td>
                  <Td muted>{r.reason[lang]}</Td>
                  <Td mono>{r.attachments}</Td>
                  <Td><span className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase ${statusTone[r.status]}`}>{r.status}</span></Td>
                </tr>
              ))}
            </Table>
          </Card>
        )}

        {tab === "documents" && (
          <Card title={t("dw.documents")}>
            <div className="mb-2 flex items-center gap-1.5">
              <ActionBtn icon={Upload} label={t("dw.upload")} onClick={() => fire(t("dw.upload"))} />
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
              {deptDocs.map((doc) => {
                const Icon = doc.type === "Image" ? ImageIcon : doc.type === "Video" ? VideoIcon : doc.type === "PDF" ? FileText : FileIcon;
                return (
                  <div key={doc.id} className="flex items-start gap-3 rounded-md border border-border bg-surface p-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{doc.title[lang]}</div>
                      <div className="mono mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{doc.type} · {doc.size}</div>
                      <div className="mono mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t("dw.uploadedBy")} {doc.uploadedBy} · {doc.uploadedAt}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {tab === "activity" && (
          <Card title={t("dw.activityTimeline")}>
            <ol className="relative ml-2 border-l border-border">
              {deptActivity.map((a) => (
                <li key={a.id} className="ml-4 py-2 text-xs">
                  <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-border bg-background" />
                  <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">{a.at} · {a.actor} · {a.kind}</div>
                  <div className="mt-0.5">{a.action[lang]}</div>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {tab === "analytics" && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card title={t("dw.kpiTrends")}>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {d.kpis.map((kp) => (
                  <div key={kp.key} className="rounded-md border border-border bg-background p-2.5">
                    <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{kp.label[lang]}</div>
                    <div className="mt-1 flex items-end justify-between">
                      <div className="text-xl font-semibold tabular-nums">{kp.value.toLocaleString()}{kp.unit ? <span className="ml-1 text-[10px] text-muted-foreground">{kp.unit}</span> : null}</div>
                      <TrendChip trend={kp.trend} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card title={t("dw.attendanceTrend")}>
              <Spark values={[d.attendance - 8, d.attendance - 4, d.attendance - 2, d.attendance + 1, d.attendance - 1, d.attendance + 2, d.attendance]} />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Mini label={t("dw.participation")} value={`${d.attendance}%`} />
                <Mini label={t("dw.growth")} value={`+${Math.round(d.attendance / 12)}%`} />
                <Mini label={t("dw.performance")} value={`${d.health}/100`} />
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ActionBtn({ icon: Icon, label, onClick }: { icon: typeof Plus; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors">
      <Icon className="h-3 w-3" />{label}
    </button>
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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-background px-2 py-1.5">
      <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xs font-medium leading-tight">{value}</div>
    </div>
  );
}

function ProgressBar({ label, value, compact }: { label?: string; value: number; compact?: boolean }) {
  return (
    <div className={compact ? "" : "rounded border border-border bg-background px-2 py-1.5"}>
      {label && <div className="mono mb-0.5 flex items-center justify-between text-[9px] uppercase tracking-wider text-muted-foreground"><span>{label}</span><span className="tabular-nums">{value}%</span></div>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      {!label && <div className="mono mt-0.5 text-right text-[9px] uppercase tracking-wider text-muted-foreground tabular-nums">{value}%</div>}
    </div>
  );
}

function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  const w = 100, h = 36;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.2" className="text-emerald-500" />
    </svg>
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
