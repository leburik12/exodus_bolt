import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Search, Command, Plus, Upload, Filter, Download, Archive, FolderInput, X } from "lucide-react";
import { AppShell, Avatar } from "@/components/app-shell";
import { members as ALL, giftCatalog, cellGroupCatalog } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Member Graph // Zetseat" },
      { name: "description", content: "High-throughput member registrar engine. Search, inspect and mutate the church member graph." },
    ],
  }),
  component: MembersPage,
});

const STATUS_OPTIONS = ["Single", "Married", "Engaged", "Widowed"] as const;
const ZONE_OPTIONS = Array.from(new Set(ALL.map((m) => m.zone)));

function MembersPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [fStatus, setFStatus] = useState<string[]>([]);
  const [fZone, setFZone] = useState<string[]>([]);
  const [fGift, setFGift] = useState<string[]>([]);
  const [fCell, setFCell] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [focusIdx, setFocusIdx] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ALL.filter((m) => {
      if (term && !(
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.id.toLowerCase().includes(term) ||
        m.occupation.toLowerCase().includes(term)
      )) return false;
      if (fStatus.length && !fStatus.includes(m.maritalStatus)) return false;
      if (fZone.length && !fZone.includes(m.zone)) return false;
      if (fCell.length && !fCell.includes(m.cellGroup)) return false;
      if (fGift.length && !m.gifts.some((g) => fGift.includes(g.name))) return false;
      return true;
    });
  }, [q, fStatus, fZone, fGift, fCell]);

  useEffect(() => { setFocusIdx(0); }, [q, fStatus, fZone, fGift, fCell]);

  const activeFacets = fStatus.length + fZone.length + fGift.length + fCell.length;
  const clearAll = () => { setFStatus([]); setFZone([]); setFGift([]); setFCell([]); };
  const toggleArr = (setter: (v: string[]) => void, arr: string[], v: string) =>
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const active = rows[focusIdx] ?? rows[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "ArrowDown" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(rows.length - 1, i + 1));
      } else if (e.key === "ArrowUp" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Escape") {
        setFilterOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rows.length]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (filterOpen && filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [filterOpen]);

  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };


  return (
    <AppShell>
      <div className="flex h-full min-h-0">
        {/* LEFT 65% */}
        <section className="flex min-w-0 flex-1 flex-col border-r border-border" style={{ flexBasis: "65%" }}>
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-border bg-surface px-5 py-3">
            <div className="flex items-center justify-between gap-3">
              <h1 className="mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
                ZETSEAT // <span className="text-muted-foreground">{t("mb.title").toUpperCase().replace(/ /g,"_")}</span>
              </h1>
              <div className="flex items-center gap-2">
                <div ref={filterRef} className="relative">
                  <button
                    onClick={() => setFilterOpen((v) => !v)}
                    className={[
                      "mono inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                      activeFacets > 0
                        ? "border-amber/50 bg-amber-soft text-foreground"
                        : "border-border bg-surface text-foreground hover:bg-muted",
                    ].join(" ")}
                  >
                    <Filter className="h-3.5 w-3.5" /> {t("mb.filter").toUpperCase()}
                    {activeFacets > 0 && (
                      <span className="mono rounded-sm bg-foreground px-1 text-[9px] font-bold text-background">{activeFacets}</span>
                    )}
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 top-full z-30 mt-1 w-[360px] rounded-lg border border-border bg-popover p-3 shadow-xl">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Filter facets</span>
                        <button onClick={clearAll} className="mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Clear all</button>
                      </div>
                      <FilterGroup title="Marital Status" options={STATUS_OPTIONS as readonly string[]} value={fStatus} onToggle={(v) => toggleArr(setFStatus, fStatus, v)} />
                      <FilterGroup title="Zone" options={ZONE_OPTIONS} value={fZone} onToggle={(v) => toggleArr(setFZone, fZone, v)} />
                      <FilterGroup title="Cell Group" options={cellGroupCatalog} value={fCell} onToggle={(v) => toggleArr(setFCell, fCell, v)} />
                      <FilterGroup title="Spiritual Gift" options={giftCatalog} value={fGift} onToggle={(v) => toggleArr(setFGift, fGift, v)} />
                    </div>
                  )}
                </div>
                <Link to="/members/new" className="mono inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-background hover:opacity-90">
                  <Plus className="h-3.5 w-3.5" /> N · {t("mb.new")}
                </Link>
              </div>
            </div>
            {/* Omnisearch */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("mb.search")}
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-24 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
              />
              <kbd className="mono absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                <Command className="h-3 w-3" /> K
              </kbd>
            </div>
            {/* Active filter pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                ...fStatus.map((v) => ({ k: "Status", v, clear: () => setFStatus(fStatus.filter((x) => x !== v)) })),
                ...fZone.map((v) => ({ k: "Zone", v, clear: () => setFZone(fZone.filter((x) => x !== v)) })),
                ...fCell.map((v) => ({ k: "Cell", v, clear: () => setFCell(fCell.filter((x) => x !== v)) })),
                ...fGift.map((v) => ({ k: "Gift", v, clear: () => setFGift(fGift.filter((x) => x !== v)) })),
              ].map((f, i) => (
                <button
                  key={`${f.k}-${f.v}-${i}`}
                  onClick={f.clear}
                  className="mono group inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground hover:border-amber"
                >
                  <span className="text-muted-foreground">{f.k}:</span> {f.v}
                  <X className="h-2.5 w-2.5 opacity-50 group-hover:opacity-100" />
                </button>
              ))}
              <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
                · {activeFacets} active {activeFacets === 1 ? "facet" : "facets"}
              </span>
            </div>
          </div>


          {/* Table */}
          <div className="relative flex-1 overflow-auto scrollbar-thin">
            <table className="w-full border-separate border-spacing-0 text-[12.5px]">
              <thead className="sticky top-0 z-10 bg-background">
                <tr className="mono text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="w-8 border-b border-border px-3 py-2">
                    <input type="checkbox" checked={selected.size === rows.length} onChange={toggleAll} className="h-3.5 w-3.5 accent-amber" />
                  </th>
                  <th className="w-10 border-b border-border px-2 py-2">AVA</th>
                  <th className="border-b border-border px-2 py-2">MEMBER_ID</th>
                  <th className="border-b border-border px-2 py-2">FULL_NAME</th>
                  <th className="border-b border-border px-2 py-2">EMAIL</th>
                  <th className="border-b border-border px-2 py-2">PHONE</th>
                  <th className="border-b border-border px-2 py-2">STATUS</th>
                  <th className="border-b border-border px-2 py-2">OCCUPATION</th>
                  <th className="border-b border-border px-2 py-2">CELL_ID</th>
                  <th className="border-b border-border px-2 py-2">GIFTS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m, i) => {
                  const isActive = i === focusIdx;
                  const isChecked = selected.has(m.id);
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setFocusIdx(i)}
                      className={[
                        "group relative cursor-pointer border-b border-hairline transition-colors",
                        isActive ? "bg-amber-soft/60" : "hover:bg-muted/60",
                      ].join(" ")}
                    >
                      <td className={["relative border-b border-hairline px-3 py-1.5", isActive ? "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-amber" : ""].join(" ")}>
                        <input type="checkbox" checked={isChecked} onChange={() => toggleOne(m.id)} onClick={(e) => e.stopPropagation()} className="h-3.5 w-3.5 accent-amber" />
                      </td>
                      <td className="border-b border-hairline px-2 py-1.5">
                        <Avatar src={m.avatar} alt={m.name} size={28} />
                      </td>
                      <td className="mono border-b border-hairline px-2 py-1.5 text-[11px] text-muted-foreground">{m.id}</td>
                      <td className="border-b border-hairline px-2 py-1.5 font-medium text-foreground">{m.name}</td>
                      <td className="border-b border-hairline px-2 py-1.5 text-muted-foreground">{m.email}</td>
                      <td className="mono border-b border-hairline px-2 py-1.5 text-[11px] text-muted-foreground">{m.phone}</td>
                      <td className="border-b border-hairline px-2 py-1.5">
                        <span className="rounded-sm border border-border bg-background px-1.5 py-0.5 text-[10.5px] text-foreground">{m.maritalStatus}</span>
                      </td>
                      <td className="border-b border-hairline px-2 py-1.5 text-foreground">{m.occupation}</td>
                      <td className="mono border-b border-hairline px-2 py-1.5 text-[11px] text-foreground">{m.cellGroup}</td>
                      <td className="border-b border-hairline px-2 py-1.5">
                        <div className="flex flex-wrap gap-1">
                          {m.gifts.slice(0, 2).map((g) => (
                            <span key={g.name} className="rounded-sm bg-amber-soft px-1.5 py-0.5 text-[10.5px] font-medium text-foreground">{g.name}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border bg-surface px-5 py-2">
            <div className="mono flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>Displaying <span className="font-semibold text-foreground">{rows.length}</span> of <span className="text-foreground">14,204</span> nodes</span>
              <span className="text-border">|</span>
              <span>Intake velocity Q2</span>
              <svg width="80" height="16" viewBox="0 0 80 16" className="text-amber">
                <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,12 10,9 20,11 30,6 40,8 50,4 60,5 70,2 80,3" />
              </svg>
              <span className="text-foreground">+12.4%</span>
            </div>
            <div className="mono flex items-center gap-2 text-[11px] text-muted-foreground">
              <button className="rounded border border-border px-2 py-0.5 hover:bg-muted">← Prev</button>
              <span>1 / 568</span>
              <button className="rounded border border-border px-2 py-0.5 hover:bg-muted">Next →</button>
            </div>
          </div>

          {/* Bulk floating bar */}
          {selected.size > 0 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center" style={{ width: "65%" }}>
              <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-amber/50 bg-foreground px-3 py-2 text-background shadow-lg shadow-amber/10">
                <span className="mono text-[11px] font-semibold uppercase tracking-wider text-amber">{selected.size} selected</span>
                <span className="h-4 w-px bg-background/20" />
                <button className="mono inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] hover:bg-background/10"><FolderInput className="h-3.5 w-3.5" />Change Cell</button>
                <button className="mono inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] hover:bg-background/10"><Download className="h-3.5 w-3.5" />Export JSON</button>
                <button className="mono inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] hover:bg-background/10"><Archive className="h-3.5 w-3.5" />Archive</button>
                <button onClick={() => setSelected(new Set())} className="mono rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-background/10">Clear</button>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT 35% Inspector */}
        <aside className="flex w-[35%] min-w-[360px] flex-col overflow-y-auto scrollbar-thin bg-background">
          {active && <Inspector m={active} />}
        </aside>
      </div>
    </AppShell>
  );
}

function Inspector({ m }: { m: typeof ALL[number] }) {
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">INSPECTOR_NODE</div>
          <div className="mono text-[11px] text-foreground">{m.id} · {m.uuid}</div>
        </div>
        <button className="mono rounded-md border border-border bg-surface px-2 py-1 text-[10px] uppercase tracking-wider text-foreground hover:bg-muted">Edit</button>
      </div>

      {/* Profile image */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-lg border border-border">
        <img src={m.avatar.replace("w=160&h=160", "w=480&h=480")} alt={m.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 bg-gradient-to-t from-foreground/70 via-foreground/0 to-foreground/0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-amber bg-background/90 py-3 text-foreground">
            <Upload className="h-4 w-4 text-amber" />
            <span className="mono text-[11px] uppercase tracking-wider">Drop · Crop · Replace</span>
          </div>
        </div>
      </div>

      <div>
        <div className="text-base font-semibold text-foreground">{m.name}</div>
        <div className="text-[12.5px] text-muted-foreground">{m.occupation} · {m.zone}</div>
      </div>

      <Section title="PERSONAL">
        <KV k="Full Name" v={m.name} />
        <KV k="Gender" v={m.gender} />
        <KV k="Marital Status" v={m.maritalStatus} />
        <KV k="Occupation" v={m.occupation} />
        <KV k="Conversion" v={m.conversionDate} mono />
      </Section>
      <Section title="CONTACT / COMMS">
        <KV k="Email" v={m.email} />
        <KV k="Phone" v={m.phone} mono />
        <KV k="Address" v={m.address} />
        <KV k="Emergency" v={`${m.emergency.name} · ${m.emergency.phone}`} />
      </Section>
      <Section title="NETWORK NODE">
        <KV k="Cell Group" v={m.cellGroup} mono />
        <KV k="Cell Leader" v={m.cellLeader} />
      </Section>

      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">SPIRITUAL_GENOME</div>
          <button className="mono text-[10px] uppercase tracking-wider text-amber hover:underline">+ Add</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {m.gifts.map((g) => (
            <span key={g.name} className="group/chip relative inline-flex items-center gap-1.5 rounded-md border border-amber/40 bg-amber-soft px-2 py-1 text-[11px] font-medium text-foreground">
              {g.name}
              <span className="mono text-[10px] text-muted-foreground">{g.match}% match</span>
              <span className="mono pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded border border-border bg-popover px-1.5 py-0.5 text-[10px] text-foreground shadow-sm group-hover/chip:block">
                verified · peer-attested
              </span>
            </span>
          ))}
          {giftCatalog.slice(0, 1).map((g) => (
            <span key={g} className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground">
              + suggest {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="mono border-b border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
      <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 p-3 text-[12.5px]">{children}</dl>
    </div>
  );
}
function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={`min-w-0 truncate font-medium text-foreground ${mono ? "mono text-[11.5px]" : ""}`}>{v}</dd>
    </>
  );
}

function FilterGroup({ title, options, value, onToggle }: { title: string; options: readonly string[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="border-t border-hairline py-2 first:border-t-0">
      <div className="mono mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              className={[
                "mono rounded-md border px-2 py-1 text-[10.5px] font-medium transition-colors",
                on
                  ? "border-amber/50 bg-amber-soft text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-amber/40 hover:text-foreground",
              ].join(" ")}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
