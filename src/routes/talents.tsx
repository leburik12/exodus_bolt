import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X, ArrowRight, Check, Loader2 } from "lucide-react";
import { AppShell, Avatar } from "@/components/app-shell";
import { members as ALL, giftCatalog } from "@/lib/mock-data";

export const Route = createFileRoute("/talents")({
  head: () => ({
    meta: [
      { title: "Talent Engine // Zetseat" },
      { name: "description", content: "Peer recommendation intake and pastoral verification queue for spiritual talents." },
    ],
  }),
  component: TalentsPage,
});

type Rec = {
  id: string;
  fromIdx: number;
  toIdx: number;
  gifts: string[];
  evidence: string;
  age: string;
};

const seedRecs: Rec[] = [
  { id: "r1", fromIdx: 3, toIdx: 7, gifts: ["Leadership", "Administration"], age: "12m ago",
    evidence: "Demonstrated exceptional organizational leadership while coordinating our last community cell outreach program; managed logistics for 240+ attendees and recruited 14 volunteers without supervisory escalation." },
  { id: "r2", fromIdx: 5, toIdx: 11, gifts: ["Teaching"], age: "37m ago",
    evidence: "Led the discipleship study for three consecutive weeks. Members reported deeper comprehension; explanations were exegetically careful and pastorally framed." },
  { id: "r3", fromIdx: 9, toIdx: 2, gifts: ["Discernment", "Wisdom"], age: "1h ago",
    evidence: "Privately flagged a doctrinal drift in a guest speaker's framing before leadership noticed; raised it with grace and Scripture." },
  { id: "r4", fromIdx: 14, toIdx: 6, gifts: ["Encouragement", "Mercy"], age: "2h ago",
    evidence: "Consistently visits hospitalized members across the Bole and CMC zones. Three families specifically named her in our last quarterly retention survey." },
  { id: "r5", fromIdx: 1, toIdx: 12, gifts: ["Prophecy"], age: "4h ago",
    evidence: "Spoke a timely, scripturally aligned word at the Wednesday prayer gathering that resonated with two unspoken situations in the room. Confirmed by 2 elders." },
  { id: "r6", fromIdx: 8, toIdx: 4, gifts: ["Evangelism"], age: "6h ago",
    evidence: "Led 9 first-time visitors through the gospel conversation framework over the last 30 days; 3 entered the membership pipeline." },
];

function TalentsPage() {
  // form state
  const [target, setTarget] = useState<typeof ALL[number] | null>(null);
  const [picker, setPicker] = useState("");
  const [pickedGifts, setPickedGifts] = useState<string[]>([]);
  const [evidence, setEvidence] = useState("");
  const [disclosure, setDisclosure] = useState<"pastoral" | "member">("pastoral");
  const [submitting, setSubmitting] = useState(false);

  const [queue, setQueue] = useState<Rec[]>(seedRecs);
  const [verified, setVerified] = useState(0);

  const searchHits = useMemo(() => {
    if (!picker.trim()) return [] as typeof ALL;
    return ALL.filter((m) => m.name.toLowerCase().includes(picker.toLowerCase())).slice(0, 5);
  }, [picker]);

  const canSubmit = target && pickedGifts.length > 0 && evidence.length >= 50;

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setTarget(null); setPickedGifts([]); setEvidence(""); setPicker("");
    }, 900);
  };

  const decide = (id: string, verify: boolean) => {
    setQueue((q) => q.filter((r) => r.id !== id));
    if (verify) setVerified((v) => v + 1);
  };

  return (
    <AppShell>
      <div className="grid h-full min-h-0 grid-cols-[45%_55%]">
        {/* LEFT INTAKE */}
        <section className="flex min-h-0 flex-col border-r border-border bg-background">
          <header className="border-b border-border bg-surface px-5 py-3">
            <h1 className="mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
              EMERGING_TALENT // <span className="text-muted-foreground">SUBMIT_RECOMMENDATION</span>
            </h1>
          </header>
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
            <div className="space-y-5 rounded-xl border border-border bg-surface p-6">
              {/* Target picker */}
              <Field label="TARGET NODE">
                {target ? (
                  <div className="flex items-center gap-2 rounded-md border border-amber/50 bg-amber-soft px-2 py-1.5">
                    <Avatar src={target.avatar} alt={target.name} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-foreground">{target.name}</div>
                      <div className="mono truncate text-[10.5px] text-muted-foreground">{target.id} · {target.cellGroup}</div>
                    </div>
                    <button onClick={() => setTarget(null)} className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={picker}
                      onChange={(e) => setPicker(e.target.value)}
                      placeholder="Search member by name…"
                      className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
                    />
                    {searchHits.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
                        {searchHits.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => { setTarget(m); setPicker(""); }}
                            className="flex w-full items-center gap-2 border-b border-hairline px-3 py-2 text-left last:border-0 hover:bg-amber-soft"
                          >
                            <Avatar src={m.avatar} alt={m.name} size={26} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[12.5px] font-medium text-foreground">{m.name}</div>
                              <div className="mono truncate text-[10.5px] text-muted-foreground">{m.id} · {m.occupation}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Field>

              {/* Tag matrix */}
              <Field label="TALENT TAGS">
                <div className="flex flex-wrap gap-1.5">
                  {giftCatalog.map((g) => {
                    const on = pickedGifts.includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() => setPickedGifts((p) => on ? p.filter((x) => x !== g) : [...p, g])}
                        className={[
                          "rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                          on
                            ? "border-amber/50 bg-amber-soft text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-amber/40 hover:text-foreground",
                        ].join(" ")}
                      >
                        {on && <Check className="mr-1 inline h-3 w-3 text-ochre" />}
                        {g}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Evidence */}
              <Field label="EVIDENCE LOG">
                <div className="rounded-md border border-border bg-background focus-within:border-amber focus-within:ring-2 focus-within:ring-amber/30">
                  <textarea
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    rows={6}
                    placeholder="Provide explicit narrative evidence detailing why this individual possesses these spiritual talents…"
                    className="w-full resize-none rounded-md bg-transparent p-3 text-[12.5px] outline-none placeholder:italic placeholder:text-muted-foreground"
                  />
                  <div className="mono flex items-center justify-between border-t border-border px-3 py-1.5 text-[10px] uppercase tracking-wider">
                    <span className="text-muted-foreground">Markdown supported · safely escaped</span>
                    <span className={evidence.length >= 50 ? "text-emerald-600" : "text-ochre"}>
                      {evidence.length} / 50 chars min
                    </span>
                  </div>
                </div>
              </Field>

              {/* Disclosure */}
              <Field label="TRANSPARENCY">
                <div className="mono inline-flex rounded-md border border-border bg-background p-0.5 text-[10.5px] font-semibold uppercase tracking-wider">
                  <button onClick={() => setDisclosure("pastoral")} className={`rounded px-3 py-1.5 ${disclosure === "pastoral" ? "bg-foreground text-background" : "text-muted-foreground"}`}>
                    Pastoral Only · Restricted Edge
                  </button>
                  <button onClick={() => setDisclosure("member")} className={`rounded px-3 py-1.5 ${disclosure === "member" ? "bg-foreground text-background" : "text-muted-foreground"}`}>
                    Disclose to Member
                  </button>
                </div>
              </Field>

              <button
                disabled={!canSubmit || submitting}
                onClick={submit}
                className={[
                  "mono inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider transition-all",
                  canSubmit
                    ? "bg-amber text-foreground hover:brightness-95 shadow-sm shadow-amber/20"
                    : "cursor-not-allowed bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Persisting…</> : "Submit Recommendation"}
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT QUEUE */}
        <section className="flex min-h-0 flex-col bg-surface">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-3">
              <h2 className="mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">PENDING_VERIFICATION_STREAM</h2>
              <span className="mono inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                {queue.length} Alerts
              </span>
            </div>
            <div className="mono flex items-center gap-2 text-[10.5px] uppercase tracking-wider text-muted-foreground">
              <span>Verified today</span>
              <span className="text-foreground">{verified}</span>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="space-y-3">
              {queue.map((r) => {
                const from = ALL[r.fromIdx], to = ALL[r.toIdx];
                return (
                  <article key={r.id} className="rounded-xl border border-border bg-background p-4 transition-all hover:border-amber/40 hover:shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <Avatar src={from.avatar} alt={from.name} size={28} />
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Avatar src={to.avatar} alt={to.name} size={28} />
                      <div className="min-w-0 flex-1 text-[12.5px]">
                        <span className="font-semibold text-foreground">{from.name}</span>
                        <span className="text-muted-foreground"> recommends </span>
                        <span className="font-semibold text-foreground">{to.name}</span>
                        <span className="text-muted-foreground"> for </span>
                        {r.gifts.map((g) => (
                          <span key={g} className="mr-1 inline-flex rounded bg-amber-soft px-1.5 py-0.5 text-[10.5px] font-medium text-foreground">{g}</span>
                        ))}
                      </div>
                      <span className="mono shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{r.age}</span>
                    </div>
                    <blockquote className="my-2 rounded border-l-4 border-amber bg-[#FAFAFA] p-3 text-[12.5px] italic text-foreground">
                      “{r.evidence}”
                    </blockquote>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>visibility: pastoral</span>
                        <span className="text-border">·</span>
                        <span>conf: 91%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => decide(r.id, false)} className="mono rounded-md border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted">
                          Reject & Archive
                        </button>
                        <button onClick={() => decide(r.id, true)} className="mono inline-flex items-center gap-1.5 rounded-md bg-amber px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground shadow-sm shadow-amber/20 hover:brightness-95">
                          <Check className="h-3.5 w-3.5" /> Verify & Commit
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
              {queue.length === 0 && (
                <div className="grid place-items-center rounded-xl border border-dashed border-border bg-background py-16 text-center">
                  <div className="mono text-[10.5px] uppercase tracking-wider text-muted-foreground">Stream cleared · 0 pending</div>
                  <div className="mt-1 text-[13px] font-medium text-foreground">Pastoral queue is at zero. Excellent throughput.</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mono mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
