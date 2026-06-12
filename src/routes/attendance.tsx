import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Wifi,
  WifiOff,
  MapPin,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Minus,
  BarChart3,
  ExternalLink,
  Search,
  Calendar as CalendarIcon,
  FileText,
} from "lucide-react";
import { AppShell, Avatar } from "@/components/app-shell";
import { members as ALL, cellGroupCatalog } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance Telemetry · Zetseat" },
      {
        name: "description",
        content: "High-density temporal attendance commits for cell networks.",
      },
    ],
  }),
  component: AttendancePage,
});

type State = "PRESENT" | "ABSENT" | "EXCUSED" | null;

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
  { id: "2026-05-01", label: "May 01", full: "Friday · May 01, 2026" },
  { id: "2026-05-08", label: "May 08", full: "Friday · May 08, 2026" },
  { id: "2026-05-15", label: "May 15", full: "Friday · May 15, 2026" },
  { id: "2026-05-22", label: "May 22", full: "Friday · May 22, 2026" },
  { id: "2026-05-29", label: "May 29", full: "Friday · May 29, 2026" },
  { id: "2026-06-05", label: "Jun 05", full: "Friday · Jun 05, 2026" },
  { id: "2026-06-12", label: "Jun 12", full: "Friday · Jun 12, 2026" },
];

function synthState(memberId: string, epochId: string): NonNullable<State> {
  let h = 0;
  const s = memberId + "::" + epochId;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const r = h % 100;
  if (r < 78) return "PRESENT";
  if (r < 92) return "ABSENT";
  return "EXCUSED";
}

function AttendancePage() {
  const { t, lang } = useI18n();
  const [activeCell, setActiveCell] = useState(0);
  const [epoch, setEpoch] = useState("2026-06-12");
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [focusIdx, setFocusIdx] = useState(0);
  const [states, setStates] = useState<Record<string, Record<string, State>>>({});
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const cellNode = CELL_NODES[activeCell];
  const fullRoster = useMemo(
    () => ALL.filter((_, i) => i % CELL_NODES.length === activeCell),
    [activeCell],
  );
  const roster = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fullRoster;
    return fullRoster.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.nameAm.includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q),
    );
  }, [fullRoster, search]);

  const key = `${cellNode.id}::${epoch}`;
  const cellStates = states[key] || {};

  const setState = useCallback(
    (mid: string, s: State) => {
      setStates((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), [mid]: s } }));
      if (!online) setPending((p) => p + 1);
    },
    [key, online],
  );

  const present = roster.filter(
    (m) => (cellStates[m.id] ?? synthState(m.id, epoch)) === "PRESENT",
  ).length;
  const absent = roster.filter(
    (m) => (cellStates[m.id] ?? synthState(m.id, epoch)) === "ABSENT",
  ).length;
  const excused = roster.filter(
    (m) => (cellStates[m.id] ?? synthState(m.id, epoch)) === "EXCUSED",
  ).length;
  const committed = present + absent + excused;
  const quorum = roster.length ? (present / roster.length) * 100 : 0;

  const shiftEpoch = useCallback((dir: -1 | 1) => {
    setEpoch((cur) => {
      const i = EPOCHS.findIndex((x) => x.id === cur);
      const next = Math.max(0, Math.min(EPOCHS.length - 1, i + dir));
      return EPOCHS[next].id;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(roster.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        shiftEpoch(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        shiftEpoch(1);
      } else if (["p", "a", "e", "P", "A", "E"].includes(e.key)) {
        const m = roster[focusIdx];
        if (!m) return;
        const map: Record<string, State> = { p: "PRESENT", a: "ABSENT", e: "EXCUSED" };
        setState(m.id, map[e.key.toLowerCase()]);
        setFocusIdx((i) => Math.min(roster.length - 1, i + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusIdx, roster, setState, shiftEpoch]);

  useEffect(() => {
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-row="${focusIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [focusIdx]);

  const triggerExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1600);
  };

  const activeEpoch = EPOCHS.find((e) => e.id === epoch);

  return (
    <AppShell>
      <div className="flex h-full min-h-0 flex-col bg-background">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
                {t("att.title")}
              </h1>
              <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {t("att.subtitle")}
              </p>
            </div>
            <span className="mono hidden items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] text-muted-foreground md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              {t("att.operator")} · Kirubel Awoke
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/cells/$cellId"
              params={{ cellId: cellNode.id }}
              className="mono inline-flex items-center gap-1.5 rounded-md border border-amber bg-amber-soft px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-amber/30"
            >
              <BarChart3 className="h-3 w-3" />
              {t("att.openCellStats")}
            </Link>
            <SyncBadge online={online} pending={pending} />
            <button
              onClick={() => {
                setOnline((v) => !v);
                if (online) setPending(0);
              }}
              className="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
            >
              {online ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              {online ? "Simulate Offline" : "Restore Link"}
            </button>
          </div>
        </header>

        {/* 2-pane */}
        <div
          className="grid flex-1 min-h-0"
          style={{ gridTemplateColumns: "300px minmax(0,1fr)" }}
        >
          {/* LEFT */}
          <aside className="flex min-h-0 flex-col border-r border-border bg-surface">
            <SectionHead title={t("att.cellNodes")} tag={`${CELL_NODES.length}`} />
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {CELL_NODES.map((c, i) => {
                const active = i === activeCell;
                const count = ALL.filter((_, idx) => idx % CELL_NODES.length === i).length;
                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      setActiveCell(i);
                      setFocusIdx(0);
                      setSearch("");
                    }}
                    className={[
                      "block w-full border-b border-hairline px-3.5 py-3 text-left transition-colors",
                      active
                        ? "bg-amber-soft/60 border-l-2 border-l-amber"
                        : "border-l-2 border-l-transparent hover:bg-muted/50",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="mono text-[11.5px] font-semibold uppercase tracking-wider text-foreground">
                        {c.name}
                      </div>
                      <span className="mono rounded-full border border-border bg-background px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {count}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{c.vector}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Avatar src={c.leaderAvatar} alt={c.leader} size={18} />
                      <span className="text-[11px] text-foreground">{c.leader}</span>
                      <span className="mono ml-auto text-[9px] uppercase tracking-wider text-muted-foreground">
                        {t("att.lead")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Chronological Horizon */}
            <div className="border-t border-border bg-background">
              <div className="flex items-center justify-between border-b border-hairline px-3.5 py-2">
                <div className="mono text-[10px] font-semibold uppercase tracking-wider text-foreground">
                  {t("att.horizon")}
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => shiftEpoch(-1)}
                    className="rounded border border-border bg-surface p-0.5 text-muted-foreground hover:text-foreground"
                    aria-label="Previous epoch"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => shiftEpoch(1)}
                    className="rounded border border-border bg-surface p-0.5 text-muted-foreground hover:text-foreground"
                    aria-label="Next epoch"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="px-3.5 py-2.5">
                <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1">
                  {EPOCHS.map((ep) => {
                    const active = epoch === ep.id;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => setEpoch(ep.id)}
                        title={ep.full}
                        className={[
                          "mono shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all",
                          active
                            ? "border-amber bg-amber text-foreground shadow-[0_1px_0_0_var(--color-ochre)]"
                            : "border-border bg-surface text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                        ].join(" ")}
                      >
                        {ep.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-hairline p-3">
                <button
                  onClick={triggerExport}
                  disabled={exporting}
                  className={[
                    "mono inline-flex w-full items-center justify-center gap-2 rounded-md border border-foreground/10 bg-foreground px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-background transition-all",
                    exporting ? "opacity-80" : "hover:bg-foreground/90",
                  ].join(" ")}
                >
                  {exporting ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      {t("att.serializing")}
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      {t("att.export")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>

          {/* CENTER */}
          <section className="flex min-h-0 flex-col bg-background">
            <div className="flex items-center justify-between gap-4 border-b border-border bg-surface px-5 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-foreground">
                  <span>{cellNode.name}</span>
                  <span className="text-muted-foreground font-normal">·</span>
                  <span className="mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t("att.stateCommits")}
                  </span>
                </div>
                <div className="mono mt-0.5 text-[10px] text-muted-foreground">
                  {activeEpoch?.full}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setFocusIdx(0);
                    }}
                    placeholder={t("common.search")}
                    className="mono h-7 w-56 rounded-md border border-border bg-background pl-7 pr-2 text-[11px] text-foreground placeholder:text-muted-foreground focus:border-amber focus:outline-none"
                  />
                </div>
                <div className="mono flex items-center gap-3 text-[10px]">
                  <Stat label={t("att.present")} value={present} accent="amber" />
                  <Stat label={t("att.absent")} value={absent} />
                  <Stat label={t("att.excused")} value={excused} />
                  <span className="text-muted-foreground">
                    <span className="text-foreground font-semibold">{committed}</span>
                    <span className="opacity-50">/</span>
                    {roster.length} {t("att.committed")}
                  </span>
                </div>
              </div>
            </div>

            {/* Quorum bar */}
            <div className="flex items-center gap-3 border-b border-hairline bg-surface/60 px-5 py-1.5">
              <span className="mono text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("stats.quorum")}
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-amber to-ochre transition-all"
                  style={{ width: `${quorum}%` }}
                />
              </div>
              <span className="mono w-12 text-right text-[11px] font-semibold text-foreground tabular-nums">
                {quorum.toFixed(1)}%
              </span>
            </div>

            <div
              className="mono grid items-center gap-3 border-b border-border bg-background/60 px-5 py-2 text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground"
              style={{ gridTemplateColumns: "28px 1.6fr 1.4fr 88px 240px" }}
            >
              <span className="text-right">#</span>
              <span>{t("att.member")}</span>
              <span>{t("att.contact")}</span>
              <span className="text-center">Profile</span>
              <span className="text-center">{t("att.commit")}</span>
            </div>

            <div ref={gridRef} className="flex-1 overflow-y-auto scrollbar-thin">
              {roster.length === 0 && (
                <div className="mono p-8 text-center text-[11px] text-muted-foreground">
                  No members match "{search}"
                </div>
              )}
              {roster.map((m, i) => {
                const st = (cellStates[m.id] ?? synthState(m.id, epoch)) as State;
                const focused = i === focusIdx;
                return (
                  <div
                    key={m.id}
                    data-row={i}
                    onClick={() => setFocusIdx(i)}
                    className={[
                      "group grid cursor-pointer items-center gap-3 border-b border-hairline px-5 py-2.5 transition-colors",
                      focused ? "bg-amber-soft/50" : "hover:bg-muted/40",
                    ].join(" ")}
                    style={{ gridTemplateColumns: "28px 1.6fr 1.4fr 88px 240px" }}
                  >
                    <span className="mono text-right text-[10px] text-muted-foreground">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar src={m.avatar} alt={m.name} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[12.5px] font-semibold text-foreground">
                            {lang === "am" ? m.nameAm : m.name}
                          </span>
                          <span className="mono shrink-0 rounded-sm bg-foreground/8 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-foreground">
                            {m.id}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                          {m.occupation} · {m.zone}
                        </div>
                      </div>
                    </div>
                    <div className="mono min-w-0">
                      <div className="truncate text-[10.5px] text-foreground">{m.email}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{m.phone}</div>
                    </div>
                    <div className="flex justify-center">
                      <Link
                        to="/members/$memberId"
                        params={{ memberId: m.id }}
                        onClick={(e) => e.stopPropagation()}
                        className="mono inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wider text-foreground hover:border-amber hover:bg-amber-soft"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        {t("att.viewProfile")}
                      </Link>
                    </div>
                    <TriToggle value={st} onChange={(v) => setState(m.id, v)} />
                  </div>
                );
              })}
            </div>

            <div className="mono flex items-center justify-between border-t border-border bg-surface px-5 py-2 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <Key k="←→" l="Epoch" />
                <Key k="↑↓" l="Navigate" />
                <Key k="P" l={t("att.present")} />
                <Key k="A" l={t("att.absent")} />
                <Key k="E" l={t("att.excused")} />
              </div>
              <span>
                Focus row{" "}
                <span className="text-foreground font-semibold">
                  {(focusIdx + 1).toString().padStart(2, "0")}
                </span>
                /{roster.length}
              </span>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

/* ============ atoms ============ */

function SectionHead({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-surface px-3.5 py-2.5">
      <div className="text-[11.5px] font-semibold tracking-tight text-foreground">{title}</div>
      {tag && (
        <span className="mono rounded-full border border-border bg-background px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {tag}
        </span>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: "amber" }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span
        className={[
          "text-[13px] font-semibold tabular-nums",
          accent === "amber" ? "text-ochre" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </span>
    </span>
  );
}

function Key({ k, l }: { k: string; l: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <kbd className="mono rounded border border-border bg-background px-1.5 py-px text-[9.5px] font-semibold text-foreground shadow-[0_1px_0_0_var(--color-border)]">
        {k}
      </kbd>
      <span className="text-[10px] uppercase tracking-wider">{l}</span>
    </span>
  );
}

function TriToggle({ value, onChange }: { value: State; onChange: (v: State) => void }) {
  const opts: { v: NonNullable<State>; label: string; Icon: typeof Check }[] = [
    { v: "PRESENT", label: "Present", Icon: Check },
    { v: "ABSENT", label: "Absent", Icon: X },
    { v: "EXCUSED", label: "Excused", Icon: Minus },
  ];
  return (
    <div className="inline-flex w-full justify-end gap-1">
      {opts.map((o) => {
        const active = value === o.v;
        const cls = active
          ? o.v === "PRESENT"
            ? "bg-amber text-foreground border-amber"
            : o.v === "ABSENT"
            ? "bg-foreground text-background border-foreground"
            : "bg-ochre text-background border-ochre"
          : "bg-surface text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground";
        const Icon = o.Icon;
        return (
          <button
            key={o.v}
            onClick={(e) => {
              e.stopPropagation();
              onChange(active ? null : o.v);
            }}
            className={`mono inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border px-1.5 text-[9.5px] font-semibold uppercase tracking-wider transition-all ${cls}`}
            title={o.label}
          >
            <Icon className="h-3 w-3" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SyncBadge({ online, pending }: { online: boolean; pending: number }) {
  return online ? (
    <div className="mono inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Online · Synced
    </div>
  ) : (
    <div className="mono inline-flex items-center gap-1.5 rounded-full border border-ochre/40 bg-amber-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ochre">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-ochre opacity-75" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-ochre" />
      </span>
      Edge Buffer · {pending} queued
    </div>
  );
}
