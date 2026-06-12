import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Wifi, WifiOff, AlertTriangle, AlertOctagon, Activity, MapPin } from "lucide-react";
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
  retention: Array.from({ length: 8 }).map((_, k) => 0.55 + ((i * 13 + k * 7) % 45) / 100),
}));

const EPOCHS = [
  { id: "w24a", label: "W24·A", full: "Week 24 — Gathering A" },
  { id: "w24b", label: "W24·B", full: "Week 24 — Gathering B (Overtime)" },
  { id: "w23a", label: "W23·A", full: "Week 23 — Gathering A" },
  { id: "w23b", label: "W23·B", full: "Week 23 — Gathering B" },
];

function AttendancePage() {
  const [activeCell, setActiveCell] = useState(0);
  const [epoch, setEpoch] = useState("w24a");
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [focusIdx, setFocusIdx] = useState(0);
  const [states, setStates] = useState<Record<string, Record<string, State>>>({});
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

  const present = roster.filter((m) => cellStates[m.id] === "PRESENT").length;
  const absent = roster.filter((m) => cellStates[m.id] === "ABSENT").length;
  const excused = roster.filter((m) => cellStates[m.id] === "EXCUSED").length;
  const committed = present + absent + excused;
  const quorum = roster.length ? (present / roster.length) * 100 : 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowDown") { e.preventDefault(); setFocusIdx((i) => Math.min(roster.length - 1, i + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setFocusIdx((i) => Math.max(0, i - 1)); }
      else if (["p", "a", "e", "P", "A", "E"].includes(e.key)) {
        const m = roster[focusIdx]; if (!m) return;
        const map: Record<string, State> = { p: "PRESENT", a: "ABSENT", e: "EXCUSED" };
        setState(m.id, map[e.key.toLowerCase()]);
        setFocusIdx((i) => Math.min(roster.length - 1, i + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusIdx, roster, setState]);

  useEffect(() => {
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-row="${focusIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [focusIdx]);

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
          {/* LEFT — Cell node metadata */}
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
            {/* Health telemetry */}
            <div className="border-t border-border bg-background p-3 space-y-3">
              <div className="mono text-[9.5px] uppercase tracking-wider text-muted-foreground">NODE_HEALTH · {cellNode.name}</div>
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground">DENSITY</span>
                  <span className="mono text-[11px] font-semibold text-foreground">{roster.length}<span className="text-muted-foreground">/{cellNode.capacity}</span></span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-amber" style={{ width: `${(roster.length / cellNode.capacity) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground">RETENTION · 8W</span>
                  <span className="mono text-[11px] font-semibold text-foreground">{Math.round(cellNode.retention.at(-1)! * 100)}%</span>
                </div>
                <Sparkline data={cellNode.retention} />
              </div>
            </div>
          </aside>

          {/* CENTER — Temporal commits */}
          <section className="flex min-h-0 flex-col bg-background">
            <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
              <div className="mono text-[10.5px] font-semibold uppercase tracking-wider text-foreground">
                TEMPORAL_INTAKE <span className="text-muted-foreground">// STATE_COMMITS</span>
              </div>
              <div className="mono text-[10px] text-muted-foreground">EPOCH</div>
            </div>
            {/* Epoch segmented */}
            <div className="border-b border-border bg-surface px-4 pb-2">
              <div className="inline-flex rounded-md border border-border bg-background p-0.5">
                {EPOCHS.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => setEpoch(ep.id)}
                    className={[
                      "mono px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wider rounded-[5px] transition-colors",
                      epoch === ep.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                    title={ep.full}
                  >
                    {ep.label}
                  </button>
                ))}
                <div className="mono ml-2 self-center px-2 text-[10px] text-muted-foreground">
                  {EPOCHS.find((e) => e.id === epoch)?.full}
                </div>
              </div>
            </div>

            {/* Column header */}
            <div className="mono grid items-center gap-2 border-b border-border bg-surface px-4 py-1.5 text-[9.5px] uppercase tracking-wider text-muted-foreground" style={{ gridTemplateColumns: "28px 1.6fr 1.4fr 210px" }}>
              <span className="text-right">#</span>
              <span>NODE_IDENTITY</span>
              <span>CONTACT_MATRIX</span>
              <span className="text-center">STATE_COMMIT</span>
            </div>

            <div ref={gridRef} className="flex-1 overflow-y-auto scrollbar-thin">
              {roster.map((m, i) => {
                const st = cellStates[m.id] ?? null;
                const focused = i === focusIdx;
                return (
                  <div
                    key={m.id}
                    data-row={i}
                    onClick={() => setFocusIdx(i)}
                    className={[
                      "grid items-center gap-2 border-b border-hairline px-4 py-2 transition-all",
                      focused ? "bg-muted/60" : "",
                      st === "PRESENT" ? "border-l-2 border-l-amber bg-amber-soft/30 shadow-[inset_0_0_0_9999px_oklch(0.96_0.07_90/0.18)]" : "",
                      st === "ABSENT" ? "opacity-55" : "",
                      st === "EXCUSED" ? "border-l-2 border-l-ochre [border-left-style:dashed]" : "",
                    ].join(" ")}
                    style={{ gridTemplateColumns: "28px 1.6fr 1.4fr 210px" }}
                  >
                    <span className="mono text-right text-[10px] text-muted-foreground">{(i + 1).toString().padStart(2, "0")}</span>
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar src={m.avatar} alt={m.name} size={32} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[12.5px] font-semibold text-foreground">{m.name}</span>
                          <span className="mono shrink-0 rounded bg-foreground/90 px-1 py-px text-[8.5px] uppercase tracking-wider text-background">{m.gifts[0]?.name}</span>
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
                <Key k="↑↓" l="navigate" />
                <Key k="P" l="present" />
                <Key k="A" l="absent" />
                <Key k="E" l="excused" />
              </div>
              <span>committed <span className="text-foreground">{committed}</span> / {roster.length}</span>
            </div>
          </section>

          {/* RIGHT — Anomaly detector */}
          <aside className="flex min-h-0 flex-col border-l border-border bg-surface">
            <SectionHead title="ANOMALY_DETECTION_ENGINE" tag="LIVE" />
            <div className="border-b border-border p-3">
              <div className="grid grid-cols-3 gap-2">
                <Counter label="PRESENT" value={present} accent="amber" />
                <Counter label="ABSENT" value={absent} />
                <Counter label="EXCUSED" value={excused} />
              </div>
              <div className="mt-3 rounded-md border border-border bg-background p-3">
                <div className="mono flex items-baseline justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>QUORUM</span><span>{committed}/{roster.length} committed</span>
                </div>
                <div className="mono mt-1 flex items-baseline gap-1">
                  <span className="text-[32px] font-semibold leading-none tracking-tight text-foreground">{quorum.toFixed(1)}</span>
                  <span className="text-[14px] text-muted-foreground">%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-gradient-to-r from-amber to-ochre transition-all" style={{ width: `${quorum}%` }} />
                </div>
              </div>
            </div>

            {/* Anomaly stream */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mono flex items-center justify-between border-b border-border px-3 py-1.5 text-[9.5px] uppercase tracking-wider text-muted-foreground">
                <span>ANOMALY_STREAM</span>
                <span>RT · 50ms</span>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <Flag severity="critical" tag="RETENTION_CRITICAL" body={`${roster[2]?.name.toUpperCase()} breached 3 consecutive absences across W22→W24.`} />
                <Flag severity="warn" tag="STRUCTURAL_IMBALANCE" body={`${cellNode.name} density at ${Math.round((roster.length / cellNode.capacity) * 100)}% — drifting toward optimal ceiling.`} />
                <Flag severity="warn" tag="GIFTING_GAP" body={`No verified Discernment-gifted node committed PRESENT this epoch.`} />
                <Flag severity="info" tag="QUORUM_BELOW_BASELINE" body={`Quorum ${quorum.toFixed(1)}% < 80% baseline for ${cellNode.base}.`} />
                <Flag severity="critical" tag="GHOST_NODE" body={`${roster[5]?.name.toUpperCase()} uncommitted across last 2 epochs — pastoral escalation advised.`} />
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

function Counter({ label, value, accent }: { label: string; value: number; accent?: "amber" }) {
  return (
    <div className={`rounded-md border bg-background px-2 py-2 ${accent === "amber" ? "border-amber/60" : "border-border"}`}>
      <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mono text-[20px] font-semibold leading-none tracking-tight ${accent === "amber" ? "text-foreground" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 220, h = 36;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - v * h]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-full">
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.83 0.17 84)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.83 0.17 84)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill="url(#sg)" />
      <path d={d} stroke="oklch(0.68 0.16 60)" strokeWidth="1.4" fill="none" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="1.6" fill="oklch(0.16 0.01 270)" />
      ))}
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
