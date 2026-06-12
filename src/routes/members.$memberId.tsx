import { createFileRoute, Link, useParams, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Heart,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { AppShell, Avatar } from "@/components/app-shell";
import { members as ALL } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

const EPOCHS = Array.from({ length: 24 }).map((_, i) => {
  const month = 1 + (i % 12);
  const day = 7 + (i % 4) * 7;
  return {
    id: `2026-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
    label: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]} ${day}`,
  };
});

function synthState(memberId: string, epochId: string): "PRESENT" | "ABSENT" | "EXCUSED" {
  let h = 0;
  const s = memberId + "::" + epochId;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const r = h % 100;
  if (r < 78) return "PRESENT";
  if (r < 92) return "ABSENT";
  return "EXCUSED";
}

export const Route = createFileRoute("/members/$memberId")({
  head: () => ({ meta: [{ title: "Member Profile · Zetseat" }] }),
  component: MemberDetailPage,
  notFoundComponent: () => (
    <AppShell>
      <div className="p-10 text-center text-muted-foreground">Member not found.</div>
    </AppShell>
  ),
});

function MemberDetailPage() {
  const { memberId } = useParams({ from: "/members/$memberId" });
  const { t, lang } = useI18n();
  const m = ALL.find((x) => x.id === memberId);
  if (!m) throw notFound();

  const sessions = useMemo(
    () => EPOCHS.map((ep) => ({ ...ep, state: synthState(m.id, ep.id) })),
    [m.id],
  );
  const present = sessions.filter((s) => s.state === "PRESENT").length;
  const absent = sessions.filter((s) => s.state === "ABSENT").length;
  const excused = sessions.filter((s) => s.state === "EXCUSED").length;
  const rate = sessions.length ? (present / sessions.length) * 100 : 0;

  // current streak of present from latest
  let streak = 0;
  for (let i = sessions.length - 1; i >= 0; i--) {
    if (sessions[i].state === "PRESENT") streak++;
    else break;
  }

  return (
    <AppShell>
      <div className="flex h-full min-h-0 flex-col bg-background">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/attendance"
              className="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-3 w-3" /> {t("m.back")}
            </Link>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
                {t("m.profile")}
              </h1>
              <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {m.id} · {m.cellGroup}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Hero */}
          <div className="border-b border-border bg-surface px-6 py-6">
            <div className="flex items-start gap-5">
              <Avatar src={m.avatar} alt={m.name} size={96} className="ring-2 ring-amber/40" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-[24px] font-semibold tracking-tight text-foreground">
                    {lang === "am" ? m.nameAm : m.name}
                  </h2>
                  <span className="mono rounded-md border border-amber bg-amber-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ochre">
                    {m.gifts[0]?.name}
                  </span>
                </div>
                <div className="mono mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {lang === "am" ? m.name : m.nameAm} · {m.occupation}
                </div>
                <p className="mt-3 max-w-3xl text-[12.5px] leading-relaxed text-foreground/80">
                  {m.bio}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`mailto:${m.email}`}
                  className="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted"
                >
                  <Mail className="h-3 w-3" /> Email
                </a>
                <a
                  href={`tel:${m.phone}`}
                  className="mono inline-flex items-center gap-1.5 rounded-md border border-foreground/10 bg-foreground px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-background hover:bg-foreground/90"
                >
                  <Phone className="h-3 w-3" /> Call
                </a>
              </div>
            </div>
          </div>

          {/* Body grid */}
          <div className="grid gap-5 p-5" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
            {/* LEFT: Profile facts */}
            <div className="space-y-5">
              <Panel title={t("m.overview")}>
                <Facts
                  rows={[
                    [Briefcase, t("m.occupation"), m.occupation],
                    [Users, t("m.cellGroup"), `${m.cellGroup} · ${m.cellLeader}`],
                    [MapPin, t("m.zone"), m.zone],
                    [Heart, t("m.maritalStatus"), m.maritalStatus],
                    [Sparkles, t("m.gender"), m.gender],
                    [Calendar, t("m.joined"), m.joinedDate],
                    [Calendar, t("m.conversion"), m.conversionDate],
                    [MapPin, t("m.address"), m.address],
                  ]}
                />
              </Panel>

              <Panel title={t("m.contact")}>
                <Facts
                  rows={[
                    [Mail, "Email", m.email],
                    [Phone, "Phone", m.phone],
                  ]}
                />
              </Panel>

              <Panel title={t("m.emergency")}>
                <Facts
                  rows={[
                    [Users, "Name", m.emergency.name],
                    [Phone, "Phone", m.emergency.phone],
                  ]}
                />
              </Panel>

              <Panel title={t("m.gifts")}>
                <div className="space-y-2.5 p-4">
                  {m.gifts.map((g) => (
                    <div key={g.name}>
                      <div className="mono mb-1 flex items-center justify-between text-[11px]">
                        <span className="font-semibold uppercase tracking-wider text-foreground">
                          {g.name}
                        </span>
                        <span className="tabular-nums text-muted-foreground">{g.match}% match</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-to-r from-amber to-ochre"
                          style={{ width: `${g.match}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            {/* RIGHT: Attendance Stats */}
            <div className="space-y-5">
              <Panel title={t("m.attendanceStats")} tag={`${sessions.length} sessions`}>
                <div className="grid grid-cols-4 gap-px border-b border-border bg-border">
                  <StatBlock label={t("m.attRate")} value={`${rate.toFixed(1)}%`} icon={Activity} accent />
                  <StatBlock label={t("m.totalSessions")} value={sessions.length} icon={Calendar} />
                  <StatBlock label={t("m.absences")} value={absent} icon={Users} />
                  <StatBlock label={t("m.streak")} value={streak} icon={TrendingUp} />
                </div>
                <div className="p-4">
                  <div className="mono mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>Session Heatmap</span>
                    <span>
                      <Legend color="bg-amber" label={t("att.present")} />
                      <span className="ml-2">
                        <Legend color="bg-foreground" label={t("att.absent")} />
                      </span>
                      <span className="ml-2">
                        <Legend color="bg-ochre" label={t("att.excused")} />
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    {sessions.map((s) => {
                      const cls =
                        s.state === "PRESENT"
                          ? "bg-amber"
                          : s.state === "ABSENT"
                          ? "bg-foreground"
                          : "bg-ochre";
                      return (
                        <div
                          key={s.id}
                          title={`${s.label} · ${s.state}`}
                          className={`h-8 rounded ${cls} hover:opacity-80`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-px border-t border-border bg-border">
                  <Mini label={t("att.present")} value={present} accent="amber" />
                  <Mini label={t("att.absent")} value={absent} />
                  <Mini label={t("att.excused")} value={excused} />
                </div>
              </Panel>

              <Panel title="Session Ledger" tag={`${sessions.length}`}>
                <div className="max-h-[380px] overflow-y-auto scrollbar-thin">
                  {[...sessions].reverse().map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between border-b border-hairline px-4 py-2"
                    >
                      <div>
                        <div className="text-[12px] font-medium text-foreground">{s.label}</div>
                        <div className="mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
                          {s.id}
                        </div>
                      </div>
                      <StateBadge state={s.state} />
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Panel({
  title,
  tag,
  children,
}: {
  title: string;
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="text-[12px] font-semibold tracking-tight text-foreground">{title}</div>
        {tag && (
          <span className="mono rounded-full border border-border bg-background px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Facts({ rows }: { rows: [typeof Mail, string, string][] }) {
  return (
    <dl className="divide-y divide-hairline">
      {rows.map(([Icon, k, v]) => (
        <div key={k} className="grid grid-cols-[140px_1fr] items-start gap-3 px-4 py-2.5">
          <dt className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Icon className="h-3 w-3" /> {k}
          </dt>
          <dd className="text-[12px] text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function StatBlock({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  icon: typeof Mail;
  accent?: boolean;
}) {
  return (
    <div className={`bg-surface px-3 py-3 ${accent ? "bg-amber-soft/40" : ""}`}>
      <div className="mono flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        <Icon className="h-3 w-3" />
      </div>
      <div
        className={[
          "mt-1 text-[22px] font-semibold leading-none tracking-tight tabular-nums",
          accent ? "text-ochre" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function Mini({ label, value, accent }: { label: string; value: number; accent?: "amber" }) {
  return (
    <div className="bg-surface px-3 py-2">
      <div className="mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={[
          "text-[16px] font-semibold tabular-nums leading-none",
          accent === "amber" ? "text-ochre" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="mono inline-flex items-center gap-1 text-[9.5px] uppercase tracking-wider text-muted-foreground">
      <span className={`h-2 w-2 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

function StateBadge({ state }: { state: "PRESENT" | "ABSENT" | "EXCUSED" }) {
  const cls =
    state === "PRESENT"
      ? "bg-amber/20 text-ochre border-amber/40"
      : state === "ABSENT"
      ? "bg-foreground text-background border-foreground"
      : "bg-ochre/15 text-ochre border-ochre/40";
  return (
    <span
      className={`mono inline-flex items-center rounded-md border px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ${cls}`}
    >
      {state}
    </span>
  );
}
