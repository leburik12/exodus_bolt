import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, Check, User, Heart, Users as UsersIcon,
  Sparkles, Compass, Shield, FileCheck2, Upload, X, Plus, AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/members/new")({
  head: () => ({
    meta: [
      { title: "New Member Intake // Zetseat" },
      { name: "description", content: "Structured multi-domain member intake wizard." },
    ],
  }),
  component: NewMemberPage,
});

// ============= Types =============
type FormState = {
  // Core
  firstName: string; middleName: string; lastName: string; preferredName: string;
  gender: "" | "Male" | "Female";
  dob: string;
  email: string; phone: string; altPhone: string;
  addr1: string; addr2: string; subcity: string; city: string; country: string;
  maritalStatus: "" | "Single" | "Married" | "Divorced" | "Widowed" | "Engaged";
  anniversary: string;
  profession: string;
  languages: string[];
  // Spiritual
  bornAgain: boolean; conversionDate: string;
  baptized: boolean; baptismDate: string; baptismType: "" | "Immersion" | "Sprinkling" | "Infant";
  confirmed: boolean;
  prevChurch: string; prevLocation: string; prevDenomination: string;
  reasonLeaving: string; transferLetter: boolean;
  // Household
  householdRole: "" | "Head of Household" | "Spouse" | "Child" | "Dependent";
  householdName: string;
  emName: string; emRelation: string; emPhone1: string; emPhone2: string;
  // Talents
  spiritualGifts: string[]; technicalSkills: string[]; ministryInterests: string[];
  bgConsent: boolean; medicalNotes: string;
  // Discipleship
  membershipClass: boolean; membershipClassDate: string;
  pathwayStatus: "" | "Visitor" | "Regular Attender" | "Active Member" | "Inactive";
  discipleshipTrack: string; cellGroup: string; pastoralMentor: string;
  // Consent
  commPreferences: string[]; mediaConsent: boolean; gdprConsent: boolean; dataRetention: boolean;
  notes: string;
};

const EMPTY: FormState = {
  firstName: "", middleName: "", lastName: "", preferredName: "",
  gender: "", dob: "",
  email: "", phone: "", altPhone: "",
  addr1: "", addr2: "", subcity: "", city: "Addis Ababa", country: "Ethiopia",
  maritalStatus: "", anniversary: "", profession: "", languages: [],
  bornAgain: false, conversionDate: "",
  baptized: false, baptismDate: "", baptismType: "", confirmed: false,
  prevChurch: "", prevLocation: "", prevDenomination: "", reasonLeaving: "", transferLetter: false,
  householdRole: "", householdName: "",
  emName: "", emRelation: "", emPhone1: "", emPhone2: "",
  spiritualGifts: [], technicalSkills: [], ministryInterests: [],
  bgConsent: false, medicalNotes: "",
  membershipClass: false, membershipClassDate: "",
  pathwayStatus: "", discipleshipTrack: "", cellGroup: "", pastoralMentor: "",
  commPreferences: [], mediaConsent: false, gdprConsent: false, dataRetention: false,
  notes: "",
};

const GIFT_CATALOG = ["Teaching","Administration","Worship","Prophecy","Hospitality","Mercy","Evangelism","Shepherding","Leadership","Encouragement","Discernment","Wisdom","Faith"];
const SKILL_CATALOG = ["Audio/Visual","Software Development","Graphic Design","Legal","Medical/First Aid","Photography","Translation","Accounting","Counseling"];
const MINISTRY_CATALOG = ["Ushering","Children's Church","Media","Worship Team","Small Group Lead","Prayer Team","Outreach","Welcome Desk"];
const LANGS = ["Amharic","English","Oromiffa","Tigrinya","French","Arabic"];
const COMMS = ["Email","SMS","Phone Call","WhatsApp"];
const CELLS = ["Alpha-Bole","Bethel-Megenagna","Carmel-CMC","Delta-Kazanchis","Eden-Sarbet","Fountain-Gerji"];

// ============= Page =============
function NewMemberPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [f, setF] = useState<FormState>(EMPTY);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const steps = useMemo(() => ([
    { code: "CORE", label: t("nm.s.core"), icon: User },
    { code: "SPIR", label: t("nm.s.spiritual"), icon: Heart },
    { code: "HOLD", label: t("nm.s.household"), icon: UsersIcon },
    { code: "TLNT", label: t("nm.s.talents"), icon: Sparkles },
    { code: "DISC", label: t("nm.s.discipleship"), icon: Compass },
    { code: "CMPL", label: t("nm.s.consent"), icon: Shield },
    { code: "RVIW", label: t("nm.s.review"), icon: FileCheck2 },
  ]), [t]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const toggleArr = (k: keyof FormState, v: string) => {
    const cur = f[k] as string[];
    set(k, (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]) as never);
  };

  const validateStep = (idx: number): string[] => {
    const errs: string[] = [];
    if (idx === 0) {
      if (!f.firstName.trim()) errs.push("First name");
      if (!f.lastName.trim()) errs.push("Last name");
      if (!f.gender) errs.push("Gender");
      if (!f.phone.trim()) errs.push("Primary phone");
    }
    if (idx === 2) {
      if (!f.emName.trim()) errs.push("Emergency contact name");
      if (!f.emPhone1.trim()) errs.push("Emergency contact phone");
    }
    if (idx === 5) {
      if (!f.gdprConsent) errs.push("Data protection consent");
    }
    return errs;
  };

  const stepErrs = validateStep(step);
  const canNext = stepErrs.length === 0;
  const progress = ((step + 1) / steps.length) * 100;

  const submit = () => {
    if (validateStep(5).length > 0) { setStep(5); return; }
    setSubmitted(true);
    setTimeout(() => nav({ to: "/" }), 1400);
  };

  return (
    <AppShell>
      <div className="flex h-full min-h-0 flex-col bg-background">
        {/* Top Bar */}
        <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-5 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="mono inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10.5px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> {t("nm.back")}
            </Link>
            <h1 className="mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
              MEMBER_INTAKE // <span className="text-muted-foreground">{steps[step].code}_DOMAIN</span>
            </h1>
          </div>
          <div className="mono flex items-center gap-3 text-[10.5px] uppercase tracking-wider text-muted-foreground">
            <span>{t("nm.step")} <span className="text-foreground">{step + 1}</span> / {steps.length}</span>
            <div className="h-1 w-44 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-amber transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Stepper */}
          <aside className="w-[260px] shrink-0 border-r border-border bg-surface p-3">
            <ol className="space-y-1">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const done = i < step;
                const active = i === step;
                return (
                  <li key={s.code}>
                    <button
                      onClick={() => setStep(i)}
                      className={[
                        "group flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors",
                        active ? "border-amber/60 bg-amber-soft" : done ? "border-border bg-background hover:bg-muted" : "border-border bg-background hover:bg-muted",
                      ].join(" ")}
                    >
                      <span className={[
                        "grid h-7 w-7 shrink-0 place-items-center rounded-md border",
                        active ? "border-amber bg-amber text-foreground" : done ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-border bg-surface text-muted-foreground",
                      ].join(" ")}>
                        {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mono text-[9.5px] uppercase tracking-wider text-muted-foreground">{s.code}_{(i+1).toString().padStart(2,"0")}</div>
                        <div className={`truncate text-[12.5px] ${active ? "font-semibold text-foreground" : "text-foreground"}`}>{s.label}</div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mono mt-4 rounded-md border border-dashed border-border bg-background p-3 text-[10.5px] leading-relaxed text-muted-foreground">
              <div className="mb-1 font-semibold uppercase tracking-wider text-foreground">{t("nm.tipTitle")}</div>
              {t("nm.tipBody")}
            </div>
          </aside>

          {/* Form Canvas */}
          <section className="min-w-0 flex-1 overflow-y-auto scrollbar-thin">
            <div className="mx-auto max-w-3xl px-8 py-8">
              <div className="mb-6">
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-amber">{t("nm.domain")} · {steps[step].code}</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{steps[step].label}</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">{t(`nm.s.${["core","spiritual","household","talents","discipleship","consent","review"][step]}.desc`)}</p>
              </div>

              {step === 0 && <CoreStep f={f} set={set} toggleArr={toggleArr} t={t} />}
              {step === 1 && <SpiritualStep f={f} set={set} t={t} />}
              {step === 2 && <HouseholdStep f={f} set={set} t={t} />}
              {step === 3 && <TalentsStep f={f} set={set} toggleArr={toggleArr} t={t} />}
              {step === 4 && <DiscipleshipStep f={f} set={set} t={t} />}
              {step === 5 && <ConsentStep f={f} set={set} toggleArr={toggleArr} t={t} />}
              {step === 6 && <ReviewStep f={f} t={t} />}

              {stepErrs.length > 0 && (
                <div className="mt-6 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div>
                    <div className="font-semibold">{t("nm.required")}</div>
                    <div>{stepErrs.join(" · ")}</div>
                  </div>
                </div>
              )}

              {/* Nav */}
              <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-[11.5px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> {t("nm.prev")}
                </button>
                {step < steps.length - 1 ? (
                  <button
                    onClick={() => canNext && setStep((s) => s + 1)}
                    disabled={!canNext}
                    className="mono inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[11.5px] font-semibold uppercase tracking-wider text-background shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t("nm.next")} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={submitted}
                    className="mono inline-flex items-center gap-1.5 rounded-md bg-amber px-4 py-2 text-[11.5px] font-semibold uppercase tracking-wider text-foreground shadow-sm shadow-amber/30 hover:brightness-95 disabled:opacity-60"
                  >
                    {submitted ? <><Check className="h-3.5 w-3.5" /> {t("nm.committed")}</> : <>{t("nm.commit")} <Check className="h-3.5 w-3.5" /></>}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

// ============= Step Components =============
type StepProps = {
  f: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  toggleArr?: (k: keyof FormState, v: string) => void;
  t: (k: string) => string;
};

function CoreStep({ f, set, toggleArr, t }: StepProps) {
  return (
    <div className="space-y-6">
      <Card title={t("nm.g.identity")}>
        <Grid cols={3}>
          <Input label={t("nm.f.firstName")} required value={f.firstName} onChange={(v) => set("firstName", v)} />
          <Input label={t("nm.f.middleName")} value={f.middleName} onChange={(v) => set("middleName", v)} />
          <Input label={t("nm.f.lastName")} required value={f.lastName} onChange={(v) => set("lastName", v)} />
        </Grid>
        <Grid cols={3}>
          <Input label={t("nm.f.preferredName")} value={f.preferredName} onChange={(v) => set("preferredName", v)} />
          <Select label={t("nm.f.gender")} required value={f.gender} onChange={(v) => set("gender", v as FormState["gender"])} options={["", "Male", "Female"]} />
          <Input label={t("nm.f.dob")} type="date" value={f.dob} onChange={(v) => set("dob", v)} />
        </Grid>
      </Card>

      <Card title={t("nm.g.contact")}>
        <Grid cols={2}>
          <Input label={t("nm.f.email")} type="email" value={f.email} onChange={(v) => set("email", v)} mono />
          <Input label={t("nm.f.phone")} required value={f.phone} onChange={(v) => set("phone", v)} placeholder="+251 9XX XXX XXX" mono />
        </Grid>
        <Grid cols={1}>
          <Input label={t("nm.f.altPhone")} value={f.altPhone} onChange={(v) => set("altPhone", v)} mono />
        </Grid>
      </Card>

      <Card title={t("nm.g.address")}>
        <Grid cols={1}>
          <Input label={t("nm.f.addr1")} value={f.addr1} onChange={(v) => set("addr1", v)} />
          <Input label={t("nm.f.addr2")} value={f.addr2} onChange={(v) => set("addr2", v)} />
        </Grid>
        <Grid cols={3}>
          <Input label={t("nm.f.subcity")} value={f.subcity} onChange={(v) => set("subcity", v)} />
          <Input label={t("nm.f.city")} value={f.city} onChange={(v) => set("city", v)} />
          <Input label={t("nm.f.country")} value={f.country} onChange={(v) => set("country", v)} />
        </Grid>
      </Card>

      <Card title={t("nm.g.social")}>
        <Grid cols={2}>
          <Select label={t("nm.f.maritalStatus")} value={f.maritalStatus} onChange={(v) => set("maritalStatus", v as FormState["maritalStatus"])} options={["","Single","Engaged","Married","Divorced","Widowed"]} />
          {f.maritalStatus === "Married" && (
            <Input label={t("nm.f.anniversary")} type="date" value={f.anniversary} onChange={(v) => set("anniversary", v)} />
          )}
        </Grid>
        <Grid cols={1}>
          <Input label={t("nm.f.profession")} value={f.profession} onChange={(v) => set("profession", v)} />
        </Grid>
        <Chips label={t("nm.f.languages")} options={LANGS} selected={f.languages} onToggle={(v) => toggleArr!("languages", v)} />
      </Card>
    </div>
  );
}

function SpiritualStep({ f, set, t }: StepProps) {
  return (
    <div className="space-y-6">
      <Card title={t("nm.g.salvation")}>
        <Toggle label={t("nm.f.bornAgain")} value={f.bornAgain} onChange={(v) => set("bornAgain", v)} />
        {f.bornAgain && (
          <Grid cols={2}>
            <Input label={t("nm.f.conversionDate")} type="date" value={f.conversionDate} onChange={(v) => set("conversionDate", v)} />
          </Grid>
        )}
      </Card>

      <Card title={t("nm.g.sacraments")}>
        <Toggle label={t("nm.f.baptized")} value={f.baptized} onChange={(v) => set("baptized", v)} />
        {f.baptized && (
          <Grid cols={2}>
            <Input label={t("nm.f.baptismDate")} type="date" value={f.baptismDate} onChange={(v) => set("baptismDate", v)} />
            <Select label={t("nm.f.baptismType")} value={f.baptismType} onChange={(v) => set("baptismType", v as FormState["baptismType"])} options={["","Immersion","Sprinkling","Infant"]} />
          </Grid>
        )}
        <Toggle label={t("nm.f.confirmed")} value={f.confirmed} onChange={(v) => set("confirmed", v)} />
      </Card>

      <Card title={t("nm.g.origin")}>
        <Grid cols={2}>
          <Input label={t("nm.f.prevChurch")} value={f.prevChurch} onChange={(v) => set("prevChurch", v)} />
          <Input label={t("nm.f.prevLocation")} value={f.prevLocation} onChange={(v) => set("prevLocation", v)} />
        </Grid>
        <Grid cols={1}>
          <Input label={t("nm.f.prevDenomination")} value={f.prevDenomination} onChange={(v) => set("prevDenomination", v)} />
          <Textarea label={t("nm.f.reasonLeaving")} value={f.reasonLeaving} onChange={(v) => set("reasonLeaving", v)} rows={3} />
        </Grid>
        <Toggle label={t("nm.f.transferLetter")} value={f.transferLetter} onChange={(v) => set("transferLetter", v)} />
      </Card>
    </div>
  );
}

function HouseholdStep({ f, set, t }: StepProps) {
  return (
    <div className="space-y-6">
      <Card title={t("nm.g.household")}>
        <Grid cols={2}>
          <Select label={t("nm.f.householdRole")} value={f.householdRole} onChange={(v) => set("householdRole", v as FormState["householdRole"])} options={["","Head of Household","Spouse","Child","Dependent"]} />
          <Input label={t("nm.f.householdName")} value={f.householdName} onChange={(v) => set("householdName", v)} placeholder="e.g. Tesfaye Household" />
        </Grid>
      </Card>
      <Card title={t("nm.g.emergency")}>
        <Grid cols={2}>
          <Input label={t("nm.f.emName")} required value={f.emName} onChange={(v) => set("emName", v)} />
          <Select label={t("nm.f.emRelation")} value={f.emRelation} onChange={(v) => set("emRelation", v)} options={["","Spouse","Parent","Sibling","Child","Friend","Other"]} />
        </Grid>
        <Grid cols={2}>
          <Input label={t("nm.f.emPhone1")} required value={f.emPhone1} onChange={(v) => set("emPhone1", v)} mono placeholder="+251 9XX XXX XXX" />
          <Input label={t("nm.f.emPhone2")} value={f.emPhone2} onChange={(v) => set("emPhone2", v)} mono />
        </Grid>
      </Card>
    </div>
  );
}

function TalentsStep({ f, toggleArr, set, t }: StepProps) {
  return (
    <div className="space-y-6">
      <Card title={t("nm.g.spiritualGifts")}>
        <Chips options={GIFT_CATALOG} selected={f.spiritualGifts} onToggle={(v) => toggleArr!("spiritualGifts", v)} />
      </Card>
      <Card title={t("nm.g.technical")}>
        <Chips options={SKILL_CATALOG} selected={f.technicalSkills} onToggle={(v) => toggleArr!("technicalSkills", v)} />
      </Card>
      <Card title={t("nm.g.ministry")}>
        <Chips options={MINISTRY_CATALOG} selected={f.ministryInterests} onToggle={(v) => toggleArr!("ministryInterests", v)} />
      </Card>
      <Card title={t("nm.g.risk")}>
        <Toggle label={t("nm.f.bgConsent")} value={f.bgConsent} onChange={(v) => set("bgConsent", v)} hint={t("nm.f.bgConsentHint")} />
        <Textarea label={t("nm.f.medicalNotes")} value={f.medicalNotes} onChange={(v) => set("medicalNotes", v)} rows={3} hint={t("nm.f.medicalNotesHint")} />
      </Card>
    </div>
  );
}

function DiscipleshipStep({ f, set, t }: StepProps) {
  return (
    <div className="space-y-6">
      <Card title={t("nm.g.pathway")}>
        <Toggle label={t("nm.f.membershipClass")} value={f.membershipClass} onChange={(v) => set("membershipClass", v)} />
        {f.membershipClass && (
          <Grid cols={2}>
            <Input label={t("nm.f.membershipClassDate")} type="date" value={f.membershipClassDate} onChange={(v) => set("membershipClassDate", v)} />
          </Grid>
        )}
        <Grid cols={2}>
          <Select label={t("nm.f.pathwayStatus")} value={f.pathwayStatus} onChange={(v) => set("pathwayStatus", v as FormState["pathwayStatus"])} options={["","Visitor","Regular Attender","Active Member","Inactive"]} />
          <Input label={t("nm.f.discipleshipTrack")} value={f.discipleshipTrack} onChange={(v) => set("discipleshipTrack", v)} placeholder="Foundations · Leadership · Equip" />
        </Grid>
      </Card>
      <Card title={t("nm.g.cellLink")}>
        <Grid cols={2}>
          <Select label={t("nm.f.cellGroup")} value={f.cellGroup} onChange={(v) => set("cellGroup", v)} options={["", ...CELLS]} />
          <Input label={t("nm.f.pastoralMentor")} value={f.pastoralMentor} onChange={(v) => set("pastoralMentor", v)} />
        </Grid>
      </Card>
    </div>
  );
}

function ConsentStep({ f, set, toggleArr, t }: StepProps) {
  return (
    <div className="space-y-6">
      <Card title={t("nm.g.commPrefs")}>
        <Chips options={COMMS} selected={f.commPreferences} onToggle={(v) => toggleArr!("commPreferences", v)} />
      </Card>
      <Card title={t("nm.g.consent")}>
        <Toggle label={t("nm.f.mediaConsent")} value={f.mediaConsent} onChange={(v) => set("mediaConsent", v)} hint={t("nm.f.mediaConsentHint")} />
        <Toggle label={t("nm.f.gdpr")} required value={f.gdprConsent} onChange={(v) => set("gdprConsent", v)} hint={t("nm.f.gdprHint")} />
        <Toggle label={t("nm.f.dataRetention")} value={f.dataRetention} onChange={(v) => set("dataRetention", v)} />
      </Card>
      <Card title={t("nm.g.notes")}>
        <Textarea label={t("nm.f.notes")} value={f.notes} onChange={(v) => set("notes", v)} rows={4} />
      </Card>
    </div>
  );
}

function ReviewStep({ f, t }: { f: FormState; t: (k: string) => string }) {
  const sections: { title: string; rows: [string, string][] }[] = [
    { title: t("nm.g.identity"), rows: [
      [t("nm.f.firstName"), [f.firstName, f.middleName, f.lastName].filter(Boolean).join(" ") || "—"],
      [t("nm.f.gender"), f.gender || "—"],
      [t("nm.f.dob"), f.dob || "—"],
      [t("nm.f.maritalStatus"), f.maritalStatus || "—"],
      [t("nm.f.profession"), f.profession || "—"],
    ]},
    { title: t("nm.g.contact"), rows: [
      [t("nm.f.email"), f.email || "—"],
      [t("nm.f.phone"), f.phone || "—"],
      [t("nm.f.addr1"), [f.addr1, f.subcity, f.city, f.country].filter(Boolean).join(", ") || "—"],
    ]},
    { title: t("nm.g.salvation"), rows: [
      [t("nm.f.bornAgain"), f.bornAgain ? "Yes" : "No"],
      [t("nm.f.baptized"), f.baptized ? `Yes · ${f.baptismType || "—"}` : "No"],
      [t("nm.f.prevChurch"), f.prevChurch || "—"],
    ]},
    { title: t("nm.g.emergency"), rows: [
      [t("nm.f.emName"), f.emName || "—"],
      [t("nm.f.emRelation"), f.emRelation || "—"],
      [t("nm.f.emPhone1"), f.emPhone1 || "—"],
    ]},
    { title: t("nm.g.spiritualGifts"), rows: [
      [t("nm.f.languages"), f.languages.join(", ") || "—"],
      ["Gifts", f.spiritualGifts.join(", ") || "—"],
      ["Skills", f.technicalSkills.join(", ") || "—"],
      ["Ministry", f.ministryInterests.join(", ") || "—"],
    ]},
    { title: t("nm.g.cellLink"), rows: [
      [t("nm.f.cellGroup"), f.cellGroup || "—"],
      [t("nm.f.pathwayStatus"), f.pathwayStatus || "—"],
      [t("nm.f.pastoralMentor"), f.pastoralMentor || "—"],
    ]},
    { title: t("nm.g.consent"), rows: [
      [t("nm.f.gdpr"), f.gdprConsent ? "✓" : "—"],
      [t("nm.f.mediaConsent"), f.mediaConsent ? "✓" : "—"],
      ["Comms", f.commPreferences.join(", ") || "—"],
    ]},
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber/40 bg-amber-soft px-3 py-2 text-[12px] text-foreground">
        <span className="mono font-semibold uppercase tracking-wider text-amber">{t("nm.readyTitle")}</span> · {t("nm.readyBody")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {sections.map((s) => (
          <div key={s.title} className="rounded-lg border border-border bg-surface">
            <div className="mono border-b border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{s.title}</div>
            <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-1 p-3 text-[12px]">
              {s.rows.map(([k, v]) => (
                <ReviewRow key={k} k={k} v={v} />
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewRow({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="min-w-0 truncate font-medium text-foreground">{v}</dd>
    </>
  );
}

// ============= Primitives =============
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="mono flex items-center justify-between border-b border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span>{title}</span>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}
function Grid({ cols, children }: { cols: 1 | 2 | 3; children: ReactNode }) {
  const map = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" } as const;
  return <div className={`grid gap-3 ${map[cols]}`}>{children}</div>;
}
function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <div className="mono mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
      {required && <span className="text-amber">*</span>}
    </div>
  );
}
function Input({ label, value, onChange, type = "text", required, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; mono?: boolean }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30 ${mono ? "mono text-[12px]" : ""}`}
      />
    </div>
  );
}
function Select({ label, value, onChange, options, required }: { label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
      >
        {options.map((o) => <option key={o} value={o}>{o || "— Select —"}</option>)}
      </select>
    </div>
  );
}
function Textarea({ label, value, onChange, rows = 4, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
      />
      {hint && <div className="mono mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{hint}</div>}
    </div>
  );
}
function Toggle({ label, value, onChange, hint, required }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string; required?: boolean }) {
  return (
    <button
      type="button" onClick={() => onChange(!value)}
      className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${value ? "border-amber/50 bg-amber-soft" : "border-border bg-background hover:bg-muted"}`}
    >
      <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${value ? "border-amber bg-amber" : "border-border bg-background"}`}>
        {value && <Check className="h-3 w-3 text-foreground" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-medium text-foreground">
          {label} {required && <span className="text-amber">*</span>}
        </div>
        {hint && <div className="mt-0.5 text-[11.5px] text-muted-foreground">{hint}</div>}
      </div>
    </button>
  );
}
function Chips({ label, options, selected, onToggle }: { label?: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o} type="button" onClick={() => onToggle(o)}
              className={[
                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11.5px] transition-colors",
                on ? "border-amber/50 bg-amber-soft text-foreground font-medium" : "border-border bg-background text-muted-foreground hover:border-amber/40 hover:text-foreground",
              ].join(" ")}
            >
              {on ? <Check className="h-3 w-3 text-amber" /> : <Plus className="h-3 w-3" />}
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// unused but kept for future avatar upload
export const _unused = { Upload, X };
