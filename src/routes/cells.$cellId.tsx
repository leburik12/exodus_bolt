import { createFileRoute, Link, useParams, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowLeft,
  MapPin,
  Users,
  Activity,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { AppShell, Avatar } from "@/components/app-shell";
import { members as ALL, cellGroupCatalog } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

const CELL_NODES = cellGroupCatalog.map((name, i) => ({
  id: `c${i}`,
  name: `${name}-0${(i % 6) + 1}`,
  base: name,
  vector: [
    "Bole · 22 Mazoria, Bldg C",
    "Megenagna · Friendship Plaza",
    "CMC · St. Michael Rd 14",
    "Kazanchis · UN Ave 7",
    "Sarbet · Atlas Junction",
    "Gerji · Imperial 04",
  ][i],
  leader: [
    "Yared Hailu",
    "Sara Tesfaye",
    "Dawit Mekonnen",
    "Hiwot Girma",
    "Eyob Alemu",
    "Tsion Bekele",
  ][i],
  leaderAvatar: ALL[(i * 2) % ALL.length].avatar,
  capacity: 24,
}));

const EPOCHS = [
  { id: "2026-03-06", label: "Mar 06" },
  { id: "2026-03-13", label: "Mar 13" },
  { id: "2026-03-20", label: "Mar 20" },
  { id: "2026-03-27", label: "Mar 27" },
  { id: "2026-04-03", label: "Apr 03" },
  { id: "2026-04-10", label: "Apr 10" },
  { id: "2026-04-17", label: "Apr 17" },
  { id: "2026-04-24", label: "Apr 24" },
  { id: "2026-05-01", label: "May 01" },
  { id: "2026-05-08", label: "May 08" },
  { id: "2026-05-15", label: "May 15" },
  { id: "2026-05-22", label: "May 22" },
  { id: "2026-05-29", label: "May 29" },
  { id: "2026-06-05", label: "Jun 05" },
  { id: "2026-06-12", label: "Jun 12" },
];

function synthState(memberId: string, epochId: string): "PRESENT" | "ABSENT" | "EXCUSED" {
  let h = 0;
  const s = memberId + "::" + epochId;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const r = h % 100;
  if (r < 78) return "PRESENT";
  if (r < 92) return "ABSENT";
  return "EXCUSED";
}

export const Route = createFileRoute("/cells/$cellId")({
  head: () => ({ meta: [{ title: "Cell Stats · Zetseat" }] }),
  component: CellStatsPage,
  notFoundComponent: () => (
    <AppShell>
      <div className="p-10 text-center text-muted-foreground">Cell node not found.</div>
    </AppShell>
  ),
});

function CellStatsPage() {
  const { cellId } = useParams({ from: "/cells/$cellId" });
  const { t, lang } = useI18n();
  const cellIdx = CELL_NODES.findIndex((c) => c.id === cellId);
  if (cellIdx < 0) throw notFound();
  const cell = CELL_NODES[cellIdx];

  const roster = useMemo(
    () => ALL.filter((_, i) => i % CELL_NODES.length === cellIdx),
    [cellIdx],
  );

  const trend = useMemo(
    () =>
      EPOCHS.map((ep) => {
        let p = 0,
          a = 0,
          e = 0;
        roster.forEach((m) => {
          const s = synthState(m.id, ep.id);
          if (s === "PRESENT") p++;
          else if (s === "ABSENT") a++;
          else e++;
        });
        return { label: ep.label, p, a, e, rate: roster.length ? p / roster.length : 0 };
      }),
    [roster],
  );

  const totals = trend.reduce(
    (acc, t) => ({ p: acc.p + t.p, a: acc.a + t.a, e: acc.e + t.e }),
    { p: 0, a: 0, e: 0 },
  );
  const totalCommits = totals.p + totals.a + totals.e || 1;
  const avgRate = trend.reduce((s, t) => s + t.rate, 0) / (trend.length || 1);
  const latest = trend[trend.length - 1]?.rate ?? 0;
  const prev = trend[trend.length - 2]?.rate ?? 0;
  const delta = latest - prev;

  const memberStats = roster
    .map((m) => {
      let p = 0,
        a = 0;
      EPOCHS.forEach((ep) => {
        const s = synthState(m.id, ep.id);
        if (s === "PRESENT") p++;
        else if (s === "ABSENT") a++;
      });
      return { m, p, a, rate: p / EPOCHS.length };
    })
    .sort((x, y) => x.rate - y.rate);

  const breaches = memberStats.filter((s) => s.a >= 4);
  const topAttenders = [...memberStats].reverse().slice(0, 5);

  return (
    <AppShell>
      <div className="flex h-full min-h-0 flex-col bg-background">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/attendance"
              className="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-3 w-3" /> {t("stats.back")}
            </Link>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
                {cell.name} · {t("stats.title")}
              </h1>
              <p className="mono mt-0.5 flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <MapPin className="h-3 w-3" /> {cell.vector}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar src={cell.leaderAvatar} alt={cell.leader} size={28} />
            <div>
              <div className="text-[12px] font-semibold text-foreground">{cell.leader}</div>
              <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {t("att.lead")}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-3 border-b border-border bg-surface p-5">
            <Kpi
              label="Roster"
              value={roster.length}
              hint={`of ${cell.capacity} capacity`}
              icon={Users}
            />
            <Kpi
              label="Avg Attendance"
              value={`${(avgRate * 100).toFixed(1)}%`}
              hint={`${EPOCHS.length}-epoch window`}
              icon={Activity}
              accent
            />
            <Kpi
              label="Last Session"
              value={`${(latest * 100).toFixed(0)}%`}
              hint={
                <span
                  className={[
                    "mono inline-flex items-center gap-0.5 text-[10px] font-semibold",
                    delta >= 0 ? "text-emerald-600" : "text-destructive",
                  ].join(" ")}
                >
                  {delta >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {(delta * 100).toFixed(1)}% vs prev
                </span>
              }
              icon={TrendingUp}
            />
            <Kpi
              label="Breaches"
              value={breaches.length}
              hint="≥ 4 absences"
              icon={AlertOctagon}
              warn
            />
          </div>

          <div className="grid gap-5 p-5" style={{ gridTemplateColumns: "1fr 360px" }}>
            {/* Trend Canvas */}
            <Panel title={t("stats.trend")} tag={`${EPOCHS.length} epochs`}>
              <div className="p-4">
                <TrendCanvas data={trend} />
              </div>
              <div className="grid grid-cols-3 gap-px border-t border-border bg-border">
                <Cohort label={t("att.present")} value={totals.p} pct={(totals.p / totalCommits) * 100} accent="amber" />
                <Cohort label={t("att.absent")} value={totals.a} pct={(totals.a / totalCommits) * 100} />
                <Cohort label={t("att.excused")} value={totals.e} pct={(totals.e / totalCommits) * 100} />
              </div>
            </Panel>

            {/* Flag stream */}
            <Panel title={t("stats.flags")} tag={`${breaches.length}`}>
              <div className="max-h-[440px] overflow-y-auto scrollbar-thin">
                {breaches.length === 0 && (
                  <div className="mono p-6 text-center text-[11px] text-muted-foreground">
                    No retention breaches in window.
                  </div>
                )}
                {breaches.map((b) => (
                  <Flag
                    key={b.m.id}
                    severity="critical"
                    tag="Retention Breach"
                    body={`${lang === "am" ? b.m.nameAm : b.m.name} — ${b.a} absences across ${EPOCHS.length} epochs. Pastoral escalation advised.`}
                  />
                ))}
                <Flag
                  severity="warn"
                  tag="Capacity Drift"
                  body={`${cell.name} density at ${Math.round((roster.length / cell.capacity) * 100)}% of optimal ceiling (${cell.capacity}).`}
                />
                <Flag
                  severity="info"
                  tag="Quorum Baseline"
                  body={`Window avg ${(avgRate * 100).toFixed(1)}% vs 80% baseline target.`}
                />
              </div>
            </Panel>
          </div>

          {/* Member leaderboard */}
          <div className="grid gap-5 px-5 pb-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Panel title="Top Attenders" tag="Top 5">
              <MemberList rows={topAttenders} lang={lang} />
            </Panel>
            <Panel title="At-Risk" tag={`${breaches.length}`} warn>
              <MemberList rows={memberStats.slice(0, 5)} lang={lang} risk />
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Panel({
  title,
  tag,
  warn,
  children,
}: {
  title: string;
  tag?: string;
  warn?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="text-[12px] font-semibold tracking-tight text-foreground">{title}</div>
        {tag && (
          <span
            className={[
              "mono rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider",
              warn
                ? "border-ochre/40 bg-amber-soft text-ochre"
                : "border-border bg-background text-muted-foreground",
            ].join(" ")}
          >
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  warn,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: typeof Users;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg border bg-background p-3.5",
        accent ? "border-amber/50 bg-amber-soft/40" : warn ? "border-ochre/40" : "border-border",
      ].join(" ")}
    >
      <div className="mono flex items-center justify-between text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        <Icon className={`h-3.5 w-3.5 ${warn ? "text-ochre" : accent ? "text-ochre" : ""}`} />
      </div>
      <div
        className={[
          "mt-1 text-[26px] font-semibold leading-none tracking-tight tabular-nums",
          accent ? "text-ochre" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </div>
      {hint && <div className="mt-1.5 text-[10.5px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Cohort({
  label,
  value,
  pct,
  accent,
}: {
  label: string;
  value: number;
  pct: number;
  accent?: "amber";
}) {
  return (
    <div className="bg-surface px-3 py-2.5">
      <div className="mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span
          className={[
            "text-[20px] font-semibold tabular-nums leading-none",
            accent === "amber" ? "text-ochre" : "text-foreground",
          ].join(" ")}
        >
          {value}
        </span>
        <span className="mono text-[10px] text-muted-foreground">{pct.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function TrendCanvas({
  data,
}: {
  data: { label: string; rate: number; p: number; a: number; e: number }[];
}) {
  const w = 720,
    h = 200,
    pad = 28;
  const innerW = w - pad * 2,
    innerH = h - pad - 28;
  const bw = innerW / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full">
      <defs>
        <linearGradient id="tFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.83 0.17 84)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="oklch(0.83 0.17 84)" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={w - pad}
          y1={pad + innerH * (1 - g)}
          y2={pad + innerH * (1 - g)}
          stroke="oklch(0.94 0.003 270)"
          strokeWidth="1"
        />
      ))}
      {data.map((d, i) => {
        const bh = Math.max(2, d.rate * innerH);
        const x = pad + i * bw + 4;
        const y = pad + innerH - bh;
        const bwInner = Math.max(6, bw - 8);
        return (
          <g key={i}>
            <rect x={x} y={y} width={bwInner} height={bh} fill="url(#tFill)" rx="3" />
            <rect x={x} y={y} width={bwInner} height={2} fill="oklch(0.68 0.16 60)" />
            <text
              x={x + bwInner / 2}
              y={h - 8}
              textAnchor="middle"
              className="mono"
              fontSize="9"
              fill="oklch(0.5 0.01 270)"
            >
              {d.label}
            </text>
            <text
              x={x + bwInner / 2}
              y={y - 4}
              textAnchor="middle"
              className="mono"
              fontSize="9"
              fontWeight="700"
              fill="oklch(0.16 0.01 270)"
            >
              {Math.round(d.rate * 100)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Flag({
  severity,
  tag,
  body,
}: {
  severity: "critical" | "warn" | "info";
  tag: string;
  body: string;
}) {
  const cfg = {
    critical: { Icon: AlertOctagon, color: "text-destructive", bar: "bg-destructive" },
    warn: { Icon: AlertTriangle, color: "text-ochre", bar: "bg-ochre" },
    info: { Icon: Activity, color: "text-foreground", bar: "bg-foreground/60" },
  }[severity];
  const Icon = cfg.Icon;
  return (
    <div className="relative border-b border-hairline px-4 py-3 pl-5">
      <span className={`absolute left-0 top-0 h-full w-[3px] ${cfg.bar}`} />
      <div
        className={`mono flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-wider ${cfg.color}`}
      >
        <Icon className="h-3 w-3" /> {tag}
      </div>
      <p className="mt-1 text-[11.5px] leading-snug text-foreground">{body}</p>
    </div>
  );
}

function MemberList({
  rows,
  lang,
  risk,
}: {
  rows: { m: (typeof ALL)[number]; p: number; a: number; rate: number }[];
  lang: string;
  risk?: boolean;
}) {
  return (
    <div>
      {rows.map((r) => (
        <Link
          key={r.m.id}
          to="/members/$memberId"
          params={{ memberId: r.m.id }}
          className="flex items-center gap-3 border-b border-hairline px-4 py-2.5 hover:bg-muted/40"
        >
          <Avatar src={r.m.avatar} alt={r.m.name} size={32} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-semibold text-foreground">
              {lang === "am" ? r.m.nameAm : r.m.name}
            </div>
            <div className="mono truncate text-[10px] text-muted-foreground">{r.m.occupation}</div>
          </div>
          <div className="text-right">
            <div
              className={[
                "mono text-[14px] font-semibold tabular-nums",
                risk ? "text-destructive" : "text-foreground",
              ].join(" ")}
            >
              {Math.round(r.rate * 100)}%
            </div>
            <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">
              {r.a} abs · {r.p} prs
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
