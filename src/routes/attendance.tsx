import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Wifi, WifiOff, AlertTriangle, AlertOctagon, Activity, MapPin, Download, AlertCircle } from "lucide-react";
import { AppShell, Avatar } from "@/components/app-shell";
import { members as ALL, cellGroupCatalog } from "@/lib/mock-data";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Temporal Telemetry // Zetseat" },
      { name: "description", content: "High-density temporal commits interface for cell-network attendance." },
    ],
  }),
  component: AttendancePage,
});

type State = "PRESENT" | "ABSENT" | "EXCUSED" | null;

const CELL_NODES = cellGroupCatalog.map((name, i) => ({
  name: `${name}-0${(i % 6) + 1}`,
  base: name,
  vector: ["Bole · 22 Mazoria, Bldg C", "Megenagna · Friendship Plaza", "CMC · St. Michael Rd 14", "Kazanchis · UN Ave 7", "Sarbet · Atlas Junction", "Gerji · Imperial 04"][i],
  leader: ["Yared Hailu", "Sara Tesfaye", "Dawit Mekonnen", "Hiwot Girma", "Eyob Alemu", "Tsion Bekele"][i],
  leaderAvatar: ALL[i * 2].avatar,
  capacity: 16,
}));

// Chronological epochs — sequential gathering dates
const EPOCHS = [
  { id: "2026-05-01", label: "May 01", full: "Friday · May 01, 2026" },
  { id: "2026-05-08", label: "May 08", full: "Friday · May 08, 2026" },
  { id: "2026-05-15", label: "May 15", full: "Friday · May 15, 2026" },
  { id: "2026-05-22", label: "May 22", full: "Friday · May 22, 2026" },
  { id: "2026-05-29", label: "May 29", full: "Friday · May 29, 2026" },
  { id: "2026-06-05", label: "Jun 05", full: "Friday · Jun 05, 2026" },
  { id: "2026-06-12", label: "Jun 12", full: "Friday · Jun 12, 2026" },
];

// Deterministic synthesized historical state per member-epoch
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
  const [activeCell, setActiveCell] = useState(0);
  const [epoch, setEpoch] = useState("2026-06-12");
  const [rangeStart, setRangeStart] = useState("2026-05-01");
  const [rangeEnd, setRangeEnd] = useState("2026-06-12");
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [focusIdx, setFocusIdx] = useState(0);
  const [states, setStates] = useState<Record<string, Record<string, State>>>({});
  const [exporting, setExporting] = useState(false);
  const [recalcTick, setRecalcTick] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const cellNode = CELL_NODES[activeCell];
  const roster = useMemo(
    () => ALL.filter((_, i) => i % CELL_NODES.length === activeCell).slice(0, 14),
    [activeCell],
  );

  const key = `${cellNode.name}::${epoch}`;
  const cellStates = states[key] || {};

  const setState = useCallback((mid: string, s: State) => {
    setStates((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), [mid]: s } }));
    if (!online) setPending((p) => p + 1);
  }, [key, online]);

  // Resolve effective state for a (member, epoch) — committed overrides synthesized
  const effective = useCallback((mid: string, epId: string): NonNullable<State> => {
    const k = `${cellNode.name}::${epId}`;
    const committed = states[k]?.[mid];
    return (committed ?? synthState(mid, epId)) as NonNullable<State>;
  }, [cellNode.name, states]);

  // Range-windowed epochs (inclusive)
  const windowEpochs = useMemo(
    () => EPOCHS.filter((e) => e.id >= rangeStart && e.id <= rangeEnd),
    [rangeStart, rangeEnd],
  );

  // Per-member analytics across the active window
  const memberAnalytics = useMemo(() => {
    const map: Record<string, { attn: number; absents: number }> = {};
    roster.forEach((m) => {
      let p = 0, a = 0;
      windowEpochs.forEach((ep) => {
        const s = effective(m.id, ep.id);
        if (s === "PRESENT") p++;
        else if (s === "ABSENT") a++;
      });
      const total = windowEpochs.length || 1;
      map[m.id] = { attn: Math.round((p / total) * 100), absents: a };
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster, windowEpochs, effective, recalcTick]);

  // Cell-wide trend across the window
  const trend = useMemo(() => {
    return windowEpochs.map((ep) => {
      let p = 0;
      roster.forEach((m) => { if (effective(m.id, ep.id) === "PRESENT") p++; });
      return { label: ep.label, value: roster.length ? p / roster.length : 0, present: p, total: roster.length };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster, windowEpochs, effective, recalcTick]);

  // Active epoch tallies
  const present = roster.filter((m) => (cellStates[m.id] ?? synthState(m.id, epoch)) === "PRESENT").length;
  const absent = roster.filter((m) => (cellStates[m.id] ?? synthState(m.id, epoch)) === "ABSENT").length;
  const excused = roster.filter((m) => (cellStates[m.id] ?? synthState(m.id, epoch)) === "EXCUSED").length;
  const committed = present + absent + excused;
  const quorum = roster.length ? (present / roster.length) * 100 : 0;

  // Hotkeys: ↑↓ navigate roster; ← → shift epoch; P/A/E commit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown") { e.preventDefault(); setFocusIdx((i) => Math.min(roster.length - 1, i + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setFocusIdx((i) => Math.max(0, i - 1)); }
      else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const i = EPOCHS.findIndex((x) => x.id === epoch);
        if (i > 0) setEpoch(EPOCHS[i - 1].id);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const i = EPOCHS.findIndex((x) => x.id === epoch);
        if (i < EPOCHS.length - 1) setEpoch(EPOCHS[i + 1].id);
      } else if (["p", "a", "e", "P", "A", "E"].includes(e.key)) {
        const m = roster[focusIdx]; if (!m) return;
        const map: Record<string, State> = { p: "PRESENT", a: "ABSENT", e: "EXCUSED" };
        setState(m.id, map[e.key.toLowerCase()]);
        setFocusIdx((i) => Math.min(roster.length - 1, i + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusIdx, roster, setState, epoch]);

  useEffect(() => {
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-row="${focusIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [focusIdx]);

  // Date-range hot reflow: 50ms recalc tick
  useEffect(() => {
    const t = setTimeout(() => setRecalcTick((n) => n + 1), 50);
    return () => clearTimeout(t);
  }, [rangeStart, rangeEnd]);

  const triggerExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1600);
  };

  return (
    <AppShell>
      <div className="flex h-full min-h-0 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2">
          <div className="flex items-baseline gap-3">
            <h1 className="mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
              TELEMETRY // <span className="text-muted-foreground">CELL_NETWORK_TEMPORAL_INTAKE</span>
            </h1>
            <span className="mono text-[10px] text-muted-foreground">OP · KIRUBEL.AWOKE</span>
          </div>
          <div className="flex items-center gap-2">
            <SyncBadge online={online} pending={pending} />
            <button
              onClick={() => { setOnline((v) => !v); if (online) setPending(0); }}
              className="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted"
            >
              {online ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              {online ? "Sever Link" : "Restore"}
            </button>
          </div>
        </header>

        {/* 3-pane grid */}
        <div className="grid flex-1 min-h-0" style={{ gridTemplateColumns: "25% 50% 25%" }}>
          {/* LEFT — Cell node metadata + Chronological Horizon Controller */}
          <aside className="flex min-h-0 flex-col border-r border-border bg-surface">
            <SectionHead title="CELL_NODE_METADATA" tag={`${CELL_NODES.length} nodes`} />
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {CELL_NODES.map((c, i) => {
                const active = i === activeCell;
                return (
                  <button
                    key={c.name}
                    onClick={() => { setActiveCell(i); setFocusIdx(0); }}
                    className={[
                      "w-full border-b border-hairline px-3 py-2.5 text-left transition-colors",
                      active ? "bg-amber-soft/60" : "hover:bg-muted/50",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="mono text-[11.5px] font-semibold uppercase tracking-wider text-foreground">{c.name}</div>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_0_3px_oklch(0.96_0.07_90)]" />}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{c.vector}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Avatar src={c.leaderAvatar} alt={c.leader} size={16} />
                      <span className="text-[11px] text-foreground">{c.leader}</span>
                      <span className="mono ml-auto text-[9.5px] uppercase tracking-wider text-muted-foreground">LEAD</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Chronological Horizon Controller */}
            <div className="border-t border-border bg-background">
              <div className="flex items-center justify-between border-b border-hairline px-3 py-1.5">
                <div className="mono text-[9.5px] uppercase tracking-wider text-muted-foreground">CHRONOLOGICAL_HORIZON</div>
                <div className="mono text-[9px] text-muted-foreground">← / → SHIFT</div>
              </div>
              {/* Time-strip slider */}
              <div className="px-3 py-2">
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
                            ? "bg-amber border-amber text-black shadow-[0_2px_0_0_var(--color-ochre),0_0_0_3px_oklch(0.96_0.07_90)] -translate-y-px"
                            : "bg-background border-border text-foreground hover:border-foreground/40",
                        ].join(" ")}
                      >
                        {ep.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dual date range */}
              <div className="border-t border-hairline px-3 py-2">
                <div className="mono mb-1.5 text-[9.5px] uppercase tracking-wider text-muted-foreground">
                  ANALYTICS_WINDOW · <span className="text-foreground">{windowEpochs.length} epochs</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <label className="block">
                    <span className="mono block text-[8.5px] uppercase tracking-wider text-muted-foreground">START</span>
                    <input
                      type="date"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="mono mt-0.5 w-full rounded-md border border-border bg-background px-1.5 py-1 text-[10.5px] text-foreground focus:border-amber focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mono block text-[8.5px] uppercase tracking-wider text-muted-foreground">END</span>
                    <input
                      type="date"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="mono mt-0.5 w-full rounded-md border border-border bg-background px-1.5 py-1 text-[10.5px] text-foreground focus:border-amber focus:outline-none"
                    />
                  </label>
                </div>
              </div>

              {/* Export trigger */}
              <div className="border-t border-hairline p-3">
                <button
                  onClick={triggerExport}
                  disabled={exporting}
                  className={[
                    "mono group relative flex w-full items-center justify-center gap-2 rounded-md border-2 border-amber bg-background px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-foreground transition-all",
                    exporting ? "opacity-80" : "hover:bg-amber-soft hover:shadow-[0_0_0_3px_oklch(0.96_0.07_90)]",
                  ].join(" ")}
                >
                  {exporting ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber border-t-transparent" />
                      SERIALIZING_MATRIX...
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      [ ⤓ EXPORT NODE MATRIX TO PDF ]
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>

          {/* CENTER — Temporal commits */}
          <section className="flex min-h-0 flex-col bg-background">
            <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
              <div className="mono text-[10.5px] font-semibold uppercase tracking-wider text-foreground">
                TEMPORAL_INTAKE <span className="text-muted-foreground">// STATE_COMMITS</span>
              </div>
              <div className="mono text-[10px] text-muted-foreground">
                {EPOCHS.find((e) => e.id === epoch)?.full}
              </div>
            </div>

            {/* Column header */}
            <div className="mono grid items-center gap-2 border-b border-border bg-surface px-4 py-1.5 text-[9.5px] uppercase tracking-wider text-muted-foreground" style={{ gridTemplateColumns: "28px 1.6fr 1.4fr 210px" }}>
              <span className="text-right">#</span>
              <span>NODE_IDENTITY · MICRO_TELEMETRY</span>
              <span>CONTACT_MATRIX</span>
              <span className="text-center">STATE_COMMIT</span>
            </div>

            <div ref={gridRef} className="flex-1 overflow-y-auto scrollbar-thin">
              {roster.map((m, i) => {
                const st = (cellStates[m.id] ?? synthState(m.id, epoch)) as State;
                const focused = i === focusIdx;
                const ana = memberAnalytics[m.id] || { attn: 0, absents: 0 };
                const breach = ana.absents >= 3;
                return (
                  <div
                    key={m.id}
                    data-row={i}
                    onClick={() => setFocusIdx(i)}
                    className={[
                      "grid items-center gap-2 border-b border-hairline px-4 py-2 transition-all",
                      focused ? "bg-muted/60" : "",
                      st === "PRESENT" ? "border-l-2 border-l-amber bg-amber-soft/30" : "",
                      st === "ABSENT" ? "opacity-70" : "",
                      st === "EXCUSED" ? "border-l-2 border-l-ochre [border-left-style:dashed]" : "",
                    ].join(" ")}
                    style={{ gridTemplateColumns: "28px 1.6fr 1.4fr 210px" }}
                  >
                    <span className="mono text-right text-[10px] text-muted-foreground">{(i + 1).toString().padStart(2, "0")}</span>
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar src={m.avatar} alt={m.name} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[12.5px] font-semibold text-foreground">{m.name}</span>
                          <span className="mono shrink-0 rounded bg-foreground/90 px-1 py-px text-[8.5px] uppercase tracking-wider text-background">{m.gifts[0]?.name}</span>
                          {/* Micro-analytics telemetry chip */}
                          <span
                            className={[
                              "mono ml-auto inline-flex items-center gap-1 rounded border px-1 py-px text-[9px] font-semibold uppercase tracking-wider",
                              breach
                                ? "border-ochre/60 bg-[#FFF7E6] text-ochre"
                                : "border-border bg-[#FAFAFA] text-muted-foreground",
                            ].join(" ")}
                            title={`Across ${windowEpochs.length} epoch window`}
                          >
                            {breach && <AlertCircle className="h-2.5 w-2.5" />}
                            [ATTN: {ana.attn}% // ABSENTS: {ana.absents}]
                          </span>
                        </div>
                        <div className="truncate text-[10.5px] text-muted-foreground">{m.occupation}</div>
                      </div>
                    </div>
                    <div className="mono min-w-0">
                      <div className="truncate text-[10.5px] text-foreground">{m.email}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{m.phone}</div>
                    </div>
                    <TriToggle value={st} onChange={(v) => setState(m.id, v)} />
                  </div>
                );
              })}
            </div>

            {/* Footer hotkeys */}
            <div className="mono flex items-center justify-between border-t border-border bg-surface px-4 py-1.5 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <Key k="←→" l="epoch" />
                <Key k="↑↓" l="navigate" />
                <Key k="P" l="present" />
                <Key k="A" l="absent" />
                <Key k="E" l="excused" />
              </div>
              <span>committed <span className="text-foreground">{committed}</span> / {roster.length}</span>
            </div>
          </section>

          {/* RIGHT — Node Network Analytics Engine */}
          <aside className="flex min-h-0 flex-col border-l border-border bg-surface">
            <SectionHead title="NODE_NETWORK_ANALYTICS_ENGINE" tag="LIVE" />

            {/* Cohort vector */}
            <div className="grid grid-cols-3 gap-2 border-b border-border p-3">
              <CohortBlock label="PRESENT" value={present} variant="amber" />
              <CohortBlock label="ABSENT" value={absent} variant="muted" />
              <CohortBlock label="EXCUSED" value={excused} variant="dashed" />
            </div>

            {/* Active Quorum Gauge */}
            <div className="border-b border-border p-3">
              <div className="mono flex items-baseline justify-between text-[9.5px] uppercase tracking-wider text-muted-foreground">
                <span>ACTIVE_QUORUM</span>
                <span>{committed}/{roster.length}</span>
              </div>
              <div className="mono mt-1 flex items-baseline gap-1.5">
                <span className="text-[44px] font-semibold leading-none tracking-tight text-foreground">{quorum.toFixed(1)}</span>
                <span className="text-[16px] text-muted-foreground">%</span>
                <span className="mono ml-auto text-[9.5px] uppercase tracking-wider text-ochre">Quorum Reached</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-gradient-to-r from-amber to-ochre transition-all" style={{ width: `${quorum}%` }} />
              </div>
            </div>

            {/* Time-Series Trend Canvas */}
            <div className="border-b border-border p-3">
              <div className="mono mb-1.5 flex items-baseline justify-between text-[9.5px] uppercase tracking-wider text-muted-foreground">
                <span>TIME_SERIES_TREND</span>
                <span>{windowEpochs.length} epochs</span>
              </div>
              <TrendCanvas data={trend} />
            </div>

            {/* Retention Flag Stream */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mono flex items-center justify-between border-b border-border px-3 py-1.5 text-[9.5px] uppercase tracking-wider text-muted-foreground">
                <span>RETENTION_FLAG_STREAM</span>
                <span>RT · 50ms</span>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {Object.entries(memberAnalytics)
                  .filter(([, v]) => v.absents >= 3)
                  .slice(0, 3)
                  .map(([mid, v]) => {
                    const m = roster.find((r) => r.id === mid)!;
                    return (
                      <Flag key={mid} severity="critical" tag="RETENTION_BREACH"
                        body={`${m.name.toUpperCase()} — ${v.absents} absences across ${windowEpochs.length}-epoch window. Pastoral escalation advised.`} />
                    );
                  })}
                <Flag severity="warn" tag="STRUCTURAL_IMBALANCE" body={`${cellNode.name} density at ${Math.round((roster.length / cellNode.capacity) * 100)}% — drifting toward optimal ceiling.`} />
                <Flag severity="warn" tag="GIFTING_GAP" body={`No verified Discernment-gifted node committed PRESENT this epoch.`} />
                <Flag severity="info" tag="QUORUM_BASELINE" body={`Quorum ${quorum.toFixed(1)}% vs 80% baseline for ${cellNode.base}.`} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

/* ============ atoms ============ */

function SectionHead({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2">
      <div className="mono text-[10.5px] font-semibold uppercase tracking-wider text-foreground">{title}</div>
      {tag && <span className="mono text-[9.5px] uppercase tracking-wider text-muted-foreground">{tag}</span>}
    </div>
  );
}

function Key({ k, l }: { k: string; l: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <kbd className="mono rounded border border-border bg-background px-1.5 py-px text-[9.5px] font-semibold text-foreground shadow-[0_1px_0_0_var(--color-border)]">{k}</kbd>
      <span className="text-[10px] uppercase tracking-wider">{l}</span>
    </span>
  );
}

function TriToggle({ value, onChange }: { value: State; onChange: (v: State) => void }) {
  const opts: { v: NonNullable<State>; label: string }[] = [
    { v: "PRESENT", label: "P" },
    { v: "ABSENT", label: "A" },
    { v: "EXCUSED", label: "E" },
  ];
  return (
    <div className="inline-flex w-full justify-end gap-1">
      {opts.map((o) => {
        const active = value === o.v;
        const cls = active
          ? o.v === "PRESENT"
            ? "bg-amber text-foreground border-amber shadow-[0_0_0_3px_oklch(0.96_0.07_90)]"
            : o.v === "ABSENT"
            ? "bg-foreground text-background border-foreground"
            : "bg-ochre text-background border-ochre"
          : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground";
        return (
          <button
            key={o.v}
            onClick={(e) => { e.stopPropagation(); onChange(active ? null : o.v); }}
            className={`mono inline-flex h-7 min-w-[60px] items-center justify-center gap-1 rounded-md border px-2 text-[10px] font-semibold uppercase tracking-wider transition-all ${cls}`}
          >
            <span className="opacity-70">[</span>{o.label === "P" ? "PRESENT" : o.label === "A" ? "ABSENT" : "EXCUSED"}<span className="opacity-70">]</span>
          </button>
        );
      })}
    </div>
  );
}

function CohortBlock({ label, value, variant }: { label: string; value: number; variant: "amber" | "muted" | "dashed" }) {
  const cls =
    variant === "amber"
      ? "border-amber/60 bg-amber-soft/40"
      : variant === "dashed"
      ? "border-border [border-style:dashed] bg-background"
      : "border-border bg-background";
  const valueCls =
    variant === "amber" ? "text-ochre" : variant === "muted" ? "text-muted-foreground" : "text-foreground";
  return (
    <div className={`rounded-md border px-2 py-2 ${cls}`}>
      <div className="mono text-[8.5px] uppercase tracking-wider text-muted-foreground">[{label}]</div>
      <div className={`mono text-[22px] font-semibold leading-none tracking-tight ${valueCls}`}>{value}</div>
    </div>
  );
}

function TrendCanvas({ data }: { data: { label: string; value: number; present: number; total: number }[] }) {
  const w = 260, h = 88, pad = 14;
  if (data.length === 0) {
    return <div className="mono py-6 text-center text-[10px] text-muted-foreground">// NO_DATA_IN_WINDOW</div>;
  }
  const innerW = w - pad * 2, innerH = h - pad - 18;
  const bw = innerW / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.83 0.17 84)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="oklch(0.83 0.17 84)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* baseline */}
      <line x1={pad} x2={w - pad} y1={h - 18} y2={h - 18} stroke="oklch(0.92 0.005 270)" strokeWidth="1" />
      {data.map((d, i) => {
        const bh = Math.max(2, d.value * innerH);
        const x = pad + i * bw + 2;
        const y = h - 18 - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw - 4} height={bh} fill="url(#trendFill)" rx="2" />
            <rect x={x} y={y} width={bw - 4} height={1.5} fill="oklch(0.68 0.16 60)" />
            <text x={x + (bw - 4) / 2} y={h - 6} textAnchor="middle" className="mono" fontSize="7.5" fill="oklch(0.5 0.01 270)">{d.label}</text>
            <text x={x + (bw - 4) / 2} y={y - 2} textAnchor="middle" className="mono" fontSize="7.5" fill="oklch(0.16 0.01 270)">{Math.round(d.value * 100)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Flag({ severity, tag, body }: { severity: "critical" | "warn" | "info"; tag: string; body: string }) {
  const cfg = {
    critical: { Icon: AlertOctagon, color: "text-destructive", bar: "bg-destructive", label: "FLAG" },
    warn: { Icon: AlertTriangle, color: "text-ochre", bar: "bg-ochre", label: "ALERT" },
    info: { Icon: Activity, color: "text-foreground", bar: "bg-foreground", label: "INFO" },
  }[severity];
  const Icon = cfg.Icon;
  return (
    <div className="relative border-b border-hairline px-3 py-2 pl-4">
      <span className={`absolute left-0 top-0 h-full w-[3px] ${cfg.bar}`} />
      <div className={`mono flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-wider ${cfg.color}`}>
        <Icon className="h-3 w-3" /> [{cfg.label}: {tag}]
      </div>
      <p className="mt-0.5 text-[11px] leading-snug text-foreground">{body}</p>
    </div>
  );
}

function SyncBadge({ online, pending }: { online: boolean; pending: number }) {
  return online ? (
    <div className="mono inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      [ONLINE // ARCHITECTURAL SYNCHRONIZATION SECURE]
    </div>
  ) : (
    <div className="mono inline-flex items-center gap-1.5 rounded-md border border-ochre/40 bg-amber-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-ochre opacity-75" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-ochre" />
      </span>
      [EDGE BUFFER · {pending} OPS QUEUED]
    </div>
  );
}
