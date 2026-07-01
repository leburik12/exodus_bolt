import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Crown, Plus, GitBranch, LayoutGrid } from "lucide-react";
import { AppShell, Avatar } from "@/components/app-shell";
import { members as ALL, cellGroupCatalog } from "@/lib/mock-data";

export const Route = createFileRoute("/cells")({
  head: () => ({
    meta: [
      { title: "Cell Matrix // Zetseat" },
      { name: "description", content: "Network topology and cell group operating control center." },
    ],
  }),
  component: CellsPage,
});

const cellLeaders: Record<string, { name: string; avatar: string }> = {
  "Alpha-Bole": { name: "Yared Hailu", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces" },
  "Bethel-Megenagna": { name: "Sara Tesfaye", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces" },
  "Carmel-CMC": { name: "Dawit Mekonnen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces" },
  "Delta-Kazanchis": { name: "Hiwot Girma", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=faces" },
  "Eden-Sarbet": { name: "Eyob Alemu", avatar: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=160&h=160&fit=crop&crop=faces" },
  "Fountain-Gerji": { name: "Tsion Bekele", avatar: "https://images.unsplash.com/photo-1592621385612-4d7129426394?w=160&h=160&fit=crop&crop=faces" },
};

const giftDot: Record<string, string> = {
  Leadership: "bg-amber",
  Teaching: "bg-sky-500",
  Encouragement: "bg-emerald-500",
  Discernment: "bg-violet-500",
  Administration: "bg-rose-500",
  Prophecy: "bg-ochre",
  Hospitality: "bg-pink-500",
  Mercy: "bg-teal-500",
  Evangelism: "bg-orange-500",
  Shepherding: "bg-indigo-500",
  Wisdom: "bg-fuchsia-500",
  Faith: "bg-lime-500",
};

function CellsPage() {
  const [view, setView] = useState<"matrix" | "graph">("matrix");
  const [assignments, setAssignments] = useState<Record<string, string>>(
    Object.fromEntries(ALL.map((m) => [m.id, m.cellGroup])),
  );
  const [pulse, setPulse] = useState<string | null>(null);
  const [ctx, setCtx] = useState<{ id: string; x: number; y: number } | null>(null);

  const columns = useMemo(() => {
    // Force varied loads
    const buckets: Record<string, typeof ALL> = {};
    cellGroupCatalog.forEach((c) => (buckets[c] = []));
    ALL.forEach((m) => {
      const cg = assignments[m.id];
      buckets[cg]?.push(m);
    });
    // Inflate Carmel-CMC to >15 to trigger warn
    while (buckets["Carmel-CMC"].length < 16) {
      buckets["Carmel-CMC"].push(ALL[buckets["Carmel-CMC"].length % ALL.length]);
    }
    return buckets;
  }, [assignments]);

  const totalActive = cellGroupCatalog.length * 24;
  const onDrop = (cell: string, id: string) => {
    setAssignments((p) => ({ ...p, [id]: cell }));
    setPulse(id);
    setTimeout(() => setPulse(null), 700);
  };

  return (
    <AppShell>
      <div className="flex h-full min-h-0 flex-col" onClick={() => setCtx(null)}>
        {/* Top control bar */}
        <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-5 py-3">
          <div className="flex items-center gap-4">
            <h1 className="mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
              NETWORK_TOPOLOGY // <span className="text-muted-foreground">CELL_MATRIX</span>
            </h1>
            <div className="mono inline-flex rounded-md border border-border bg-background p-0.5 text-[10px] font-semibold uppercase tracking-wider">
              <button onClick={() => setView("matrix")} className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 ${view === "matrix" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="h-3 w-3" /> Matrix
              </button>
              <button onClick={() => setView("graph")} className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 ${view === "graph" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                <GitBranch className="h-3 w-3" /> Graph
              </button>
            </div>
          </div>
          {/* Telemetry */}
          <div className="flex items-center gap-2">
            <Telem k="Active Cells" v="142" />
            <Telem k="Avg Attendance" v="88.4%" />
            <CapacityGauge percent={71} />
          </div>
        </header>

        {view === "matrix" ? (
          <div className="flex flex-1 gap-3 overflow-x-auto overflow-y-hidden bg-background p-3 scrollbar-thin">
            {cellGroupCatalog.map((cg) => {
              const leader = cellLeaders[cg];
              const list = columns[cg];
              const warn = list.length > 15 || list.length < 8;
              return (
                <div
                  key={cg}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData("text/id");
                    if (id) onDrop(cg, id);
                  }}
                  className="group flex h-full w-[300px] shrink-0 flex-col rounded-lg border border-border bg-surface"
                >
                  {/* Column header */}
                  <div className="flex flex-col gap-2 border-b border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-foreground">{cg}</div>
                        <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">CELL_{cg.split("-")[0].toUpperCase().slice(0,3)}_{(list.length * 41).toString(16).toUpperCase()}</div>
                      </div>
                      <button className="mono hidden items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-foreground group-hover:inline-flex hover:bg-amber-soft">
                        <Crown className="h-3 w-3 text-amber" /> Promote
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar src={leader.avatar} alt={leader.name} size={24} />
                      <div className="min-w-0">
                        <div className="truncate text-[11.5px] font-medium text-foreground">{leader.name}</div>
                        <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">LEADER</div>
                      </div>
                      <Sparkline className="ml-auto" />
                    </div>
                    <div>
                      <div className="mono mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider">
                        <span className="text-muted-foreground">Capacity {list.length}/12</span>
                        <span className={warn ? "text-ochre" : "text-emerald-600"}>{warn ? "WARN" : "HEALTHY"}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${warn ? "bg-ochre" : "bg-amber"}`}
                          style={{ width: `${Math.min(100, (list.length / 18) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Cards */}
                  <div className="flex-1 space-y-1.5 overflow-y-auto p-2 scrollbar-thin">
                    {list.map((m, i) => (
                      <div
                        key={`${m.id}-${i}`}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/id", m.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setCtx({ id: m.id, x: e.clientX, y: e.clientY });
                        }}
                        className={[
                          "flex cursor-grab items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-[12px] transition-all hover:border-amber/60 hover:bg-amber-soft/40 active:cursor-grabbing",
                          pulse === m.id ? "ring-2 ring-amber shadow-[0_0_0_4px_oklch(0.96_0.07_90)]" : "",
                        ].join(" ")}
                      >
                        <Avatar src={m.avatar} alt={m.name} size={26} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-foreground">{m.name}</div>
                          <div className="truncate text-[10.5px] text-muted-foreground">{m.occupation}</div>
                        </div>
                        <span title={m.gifts[0]?.name} className={`h-2 w-2 shrink-0 rounded-full ${giftDot[m.gifts[0]?.name] ?? "bg-muted-foreground"}`} />
                      </div>
                    ))}
                  </div>
                  <div className="mono flex items-center justify-between border-t border-border px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>{list.length} nodes</span>
                    <button className="inline-flex items-center gap-1 hover:text-foreground"><Plus className="h-3 w-3" /> Add</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <GraphView />
        )}

        {/* Context menu */}
        {ctx && (
          <div
            className="fixed z-50 w-52 overflow-hidden rounded-md border border-border bg-popover text-[12px] shadow-lg"
            style={{ left: ctx.x, top: ctx.y }}
          >
            {["Make Cell Leader", "View Growth Profile", "Transfer Node Location"].map((opt) => (
              <button key={opt} className="block w-full px-3 py-2 text-left text-foreground hover:bg-amber-soft">
                {opt}
              </button>
            ))}
          </div>
        )}

        <footer className="mono flex items-center justify-between border-t border-border bg-surface px-5 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{totalActive} nodes · 6 columns rendered · drag-and-drop persistence: optimistic</span>
          <span>STATE: <span className="text-emerald-600">SYNCED</span></span>
        </footer>
      </div>
    </AppShell>
  );
}

function Telem({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col rounded-md border border-border bg-background px-3 py-1.5">
      <span className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="mono text-[13px] font-semibold text-foreground">{v}</span>
    </div>
  );
}
function CapacityGauge({ percent }: { percent: number }) {
  return (
    <div className="flex w-44 flex-col rounded-md border border-border bg-background px-3 py-1.5">
      <div className="mono flex items-center justify-between text-[9px] uppercase tracking-wider">
        <span className="text-muted-foreground">Optimal 10–12</span>
        <span className="font-semibold text-foreground">{percent}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-to-r from-amber to-ochre" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
function Sparkline({ className = "" }: { className?: string }) {
  return (
    <svg width="60" height="18" viewBox="0 0 60 18" className={`text-amber ${className}`}>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,12 8,9 16,11 24,6 32,8 40,4 48,7 60,3" />
    </svg>
  );
}

function GraphView() {
  return (
    <div className="relative flex-1 overflow-hidden bg-background">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="oklch(0.94 0.003 270)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <svg className="absolute inset-0 h-full w-full">
        {/* edges */}
        {[[400,200],[700,260],[400,400],[700,440],[1000,330]].map(([x,y],i)=>(
          <line key={i} x1="200" y1="320" x2={x} y2={y} stroke="oklch(0.83 0.17 84)" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="3 3" />
        ))}
      </svg>
      <div className="absolute left-[160px] top-[280px] flex flex-col items-center gap-1 rounded-lg border-2 border-foreground bg-surface px-3 py-2 shadow-sm">
        <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">ROOT</div>
        <div className="text-sm font-semibold text-foreground">Zetseat Bole Bulbula</div>
      </div>
      {cellGroupCatalog.slice(0,5).map((c, i) => {
        const pos = [[360,170],[660,230],[360,370],[660,410],[960,300]][i];
        return (
          <div key={c} className="absolute flex flex-col items-center gap-1 rounded-lg border border-amber/40 bg-amber-soft px-3 py-2 shadow-sm" style={{ left: pos[0], top: pos[1] }}>
            <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">CELL</div>
            <div className="text-[12px] font-semibold text-foreground">{c}</div>
          </div>
        );
      })}
      <div className="mono absolute bottom-4 right-4 rounded-md border border-border bg-surface px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        canvas · zoom: 1.0× · nodes: 6
      </div>
    </div>
  );
}
