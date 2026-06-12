import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Wifi, WifiOff, ChevronDown, ScanLine, CheckCircle2 } from "lucide-react";
import { AppShell, Avatar } from "@/components/app-shell";
import { members as ALL } from "@/lib/mock-data";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance Terminal // Zetseat" },
      { name: "description", content: "High-fidelity, local-first attendance intake terminal with QR scan and manual override." },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const roster = ALL.slice(0, 14);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [lastScan, setLastScan] = useState<{ name: string; ts: string } | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      const m = roster[Math.floor(Math.random() * roster.length)];
      const d = new Date();
      const ts = `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`;
      setLastScan({ name: m.name.toUpperCase(), ts });
      setFlash(true);
      setTimeout(() => setFlash(false), 220);
      setChecked((p) => new Set(p).add(m.id));
      if (!online) setPending((p) => p + 1);
    }, 4200);
    return () => clearInterval(t);
  }, [online, roster]);

  const toggle = (id: string) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
    if (!online) setPending((p) => p + 1);
  };

  return (
    <AppShell>
      <div className="flex h-full min-h-0 flex-col">
        {/* Top control */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
          <h1 className="mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
            ATTENDANCE // <span className="text-muted-foreground">INTAKE_TERMINAL</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="mono inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground">
              <span className="text-muted-foreground">EPOCH</span>
              Week 24 · Session A
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <SyncBadge online={online} pending={pending} />
            <button
              onClick={() => { setOnline((v) => !v); if (online) setPending(0); }}
              className="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted"
            >
              {online ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
              {online ? "Simulate Interruption" : "Restore Network"}
            </button>
          </div>
        </header>

        <div className="grid flex-1 min-h-0 grid-cols-2">
          {/* LEFT QR Scan */}
          <section className="flex min-h-0 flex-col border-r border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="mono text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">QR_SCAN_ENGINE</div>
              <div className="mono inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-emerald-600">
                <ScanLine className="h-3.5 w-3.5" /> Hardware Ready
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-xl border border-border bg-[#FAFAFA] p-6">
              <div className={`relative aspect-video w-full overflow-hidden rounded-lg bg-foreground ${flash ? "ring-4 ring-amber shadow-[0_0_60px_-10px_oklch(0.83_0.17_84)]" : "ring-0"}`}>
                {/* mock video noise */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,oklch(0.22_0.02_270)_0%,oklch(0.12_0.02_270)_60%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,oklch(1_0_0/0.02)_50%)] bg-[length:100%_3px]" />
                {/* target bracket */}
                {[
                  "left-[18%] top-[18%] border-l-2 border-t-2",
                  "right-[18%] top-[18%] border-r-2 border-t-2",
                  "left-[18%] bottom-[18%] border-l-2 border-b-2",
                  "right-[18%] bottom-[18%] border-r-2 border-b-2",
                ].map((c) => (
                  <span key={c} className={`absolute h-8 w-8 border-amber ${c}`} />
                ))}
                {/* scan line */}
                <div className="absolute inset-x-[18%] top-[18%] h-[64%] overflow-hidden">
                  <div className="absolute left-0 right-0 h-px animate-[scan_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-amber to-transparent" style={{ top: "50%" }} />
                </div>
                <div className="mono absolute left-3 top-3 text-[10px] uppercase tracking-wider text-amber/80">LIVE · 1280×720 · 30fps</div>
                <div className="mono absolute bottom-3 right-3 text-[10px] uppercase tracking-wider text-background/70">target: zetseat_qr_v3</div>
              </div>

              {lastScan && (
                <div className="mt-4 flex items-center justify-between rounded-md border border-amber/50 bg-amber-soft px-3 py-2 text-[12px] text-foreground shadow-sm animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-ochre" />
                    <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground">CHECK-IN VALIDATED</span>
                    <span className="font-semibold">{lastScan.name}</span>
                  </div>
                  <span className="mono text-[11px] text-muted-foreground">TIMESTAMP: {lastScan.ts}</span>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Stat k="Validated" v={`${checked.size}`} />
                <Stat k="Avg Latency" v="42ms" />
                <Stat k="Throughput" v="14/min" />
              </div>
            </div>
          </section>

          {/* RIGHT Manual override */}
          <section className="flex min-h-0 flex-col bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div>
                <div className="mono text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">MANUAL_OVERRIDE_MATRIX</div>
                <div className="text-[13px] font-semibold text-foreground">Alpha-Bole · Cell Roster</div>
              </div>
              <div className="mono inline-flex items-baseline gap-1 rounded-md border border-border bg-background px-3 py-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">CHECKED IN</span>
                <span className="text-[15px] font-semibold text-foreground">{checked.size}</span>
                <span className="text-[11px] text-muted-foreground">/ {roster.length}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <ul>
                {roster.map((m) => {
                  const on = checked.has(m.id);
                  return (
                    <li
                      key={m.id}
                      className={`flex items-center gap-3 border-b border-hairline px-5 py-2.5 transition-colors ${on ? "bg-amber-soft/30" : "hover:bg-muted/50"}`}
                    >
                      <Avatar src={m.avatar} alt={m.name} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-foreground">{m.name}</div>
                        <div className="mono flex items-center gap-2 text-[10.5px] text-muted-foreground">
                          <span>{m.phone}</span>
                          <span className="text-border">·</span>
                          <span className="rounded bg-muted px-1 py-px text-foreground">{m.gifts[0]?.name}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggle(m.id)}
                        className={[
                          "grid h-10 w-10 shrink-0 place-items-center rounded-md border-2 transition-all",
                          on
                            ? "border-amber bg-amber text-foreground shadow-[0_0_0_4px_oklch(0.96_0.07_90)]"
                            : "border-border bg-background hover:border-amber/60",
                        ].join(" ")}
                        aria-label={on ? "Checked in" : "Check in"}
                      >
                        {on && (
                          <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="mono flex items-center justify-between border-t border-border bg-background px-5 py-2 text-[10.5px] uppercase tracking-wider text-muted-foreground">
              <span>Optimistic write · idb queue {pending}</span>
              <span>session id <span className="text-foreground">SES_24A_0816</span></span>
            </div>
          </section>
        </div>
      </div>
      <style>{`@keyframes scan{0%{top:0%}50%{top:95%}100%{top:0%}}`}</style>
    </AppShell>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mono text-[14px] font-semibold text-foreground">{v}</div>
    </div>
  );
}

function SyncBadge({ online, pending }: { online: boolean; pending: number }) {
  return online ? (
    <div className="mono inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      [ONLINE // ASYNC STATE PIPELINE SECURE]
    </div>
  ) : (
    <div className="mono inline-flex items-center gap-1.5 rounded-md border border-ochre/40 bg-amber-soft px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-foreground">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-ochre opacity-75" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-ochre" />
      </span>
      [LOCAL STORAGE MODE · {pending} PENDING SYNC]
    </div>
  );
}
