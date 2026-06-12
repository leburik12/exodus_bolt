import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "am";

type Dict = Record<string, { en: string; am: string }>;

const DICT: Dict = {
  // Nav
  "nav.members": { en: "Members", am: "አባላት" },
  "nav.cells": { en: "Cell Matrix", am: "ሕዋስ ኔትወርክ" },
  "nav.attendance": { en: "Attendance", am: "ተገኝነት" },
  "nav.talents": { en: "Talents", am: "ስጦታዎች" },
  // Attendance
  "att.title": { en: "Attendance Telemetry", am: "የተገኝነት ቴሌሜትሪ" },
  "att.subtitle": { en: "Cell Network · Temporal Intake", am: "ሕዋስ ኔትወርክ · ጊዜያዊ ቅበላ" },
  "att.operator": { en: "Operator", am: "ኦፐሬተር" },
  "att.cellNodes": { en: "Cell Nodes", am: "የሕዋስ ኖዶች" },
  "att.horizon": { en: "Chronological Horizon", am: "የጊዜ አድማስ" },
  "att.window": { en: "Analytics Window", am: "የመተንተኛ ክልል" },
  "att.start": { en: "Start", am: "ጅማሬ" },
  "att.end": { en: "End", am: "ፍጻሜ" },
  "att.export": { en: "Export Matrix · PDF", am: "ማትሪክስ ላክ · PDF" },
  "att.serializing": { en: "Serializing…", am: "በማቅረብ ላይ…" },
  "att.stateCommits": { en: "State Commits", am: "ሁኔታ ይመዝገብ" },
  "att.committed": { en: "committed", am: "ተመዝግቧል" },
  "att.member": { en: "Member", am: "አባል" },
  "att.contact": { en: "Contact", am: "አድራሻ" },
  "att.commit": { en: "State Commit", am: "ሁኔታ ይመዝገብ" },
  "att.present": { en: "Present", am: "ተገኝቷል" },
  "att.absent": { en: "Absent", am: "አልተገኘም" },
  "att.excused": { en: "Excused", am: "ይቅርታ" },
  "att.openCellStats": { en: "Open Cell Stats", am: "የሕዋስ ስታቲስቲክስ" },
  "att.viewProfile": { en: "Profile", am: "መግለጫ" },
  "att.lead": { en: "Lead", am: "መሪ" },
  // Cell Stats
  "stats.title": { en: "Cell Node Analytics", am: "የሕዋስ ኖድ ትንተና" },
  "stats.quorum": { en: "Active Quorum", am: "ቋሚ ኮረም" },
  "stats.cohort": { en: "Cohort Vector", am: "ቡድን ቬክተር" },
  "stats.trend": { en: "Retention Trend", am: "ቀጣይነት አዝማሚያ" },
  "stats.flags": { en: "Flag Stream", am: "የማስጠንቀቂያ ዥረት" },
  "stats.back": { en: "Back to Attendance", am: "ወደ ተገኝነት ተመለስ" },
  // Member detail
  "m.profile": { en: "Member Profile", am: "የአባል መግለጫ" },
  "m.overview": { en: "Overview", am: "አጠቃላይ" },
  "m.contact": { en: "Contact", am: "አድራሻ" },
  "m.emergency": { en: "Emergency Contact", am: "የአደጋ ጊዜ አድራሻ" },
  "m.gifts": { en: "Spiritual Gifts", am: "መንፈሳዊ ስጦታዎች" },
  "m.attendanceStats": { en: "Attendance Statistics", am: "የተገኝነት ስታቲስቲክስ" },
  "m.cellGroup": { en: "Cell Group", am: "ሕዋስ ቡድን" },
  "m.zone": { en: "Zone", am: "ዞን" },
  "m.occupation": { en: "Occupation", am: "ሥራ" },
  "m.maritalStatus": { en: "Marital Status", am: "የጋብቻ ሁኔታ" },
  "m.gender": { en: "Gender", am: "ጾታ" },
  "m.joined": { en: "Joined", am: "የተቀላቀለበት" },
  "m.conversion": { en: "Conversion Date", am: "የመለወጥ ቀን" },
  "m.address": { en: "Address", am: "አድራሻ" },
  "m.attRate": { en: "Attendance Rate", am: "የተገኝነት መጠን" },
  "m.totalSessions": { en: "Total Sessions", am: "ጠቅላላ ስብሰባዎች" },
  "m.absences": { en: "Absences", am: "የቀረ" },
  "m.streak": { en: "Current Streak", am: "ቅርብ ጊዜ ቀጣይነት" },
  "m.back": { en: "Back", am: "ተመለስ" },
  // Common
  "common.search": { en: "Search…", am: "ፈልግ…" },
  "common.live": { en: "Live", am: "ቀጥታ" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18n = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zetseat.lang") as Lang | null;
      if (saved === "en" || saved === "am") setLangState(saved);
    } catch {
      /* noop */
    }
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("zetseat.lang", l);
    } catch {
      /* noop */
    }
  };
  const t = (k: string) => DICT[k]?.[lang] ?? k;
  return <I18n.Provider value={{ lang, setLang, t }}>{children}</I18n.Provider>;
}

export function useI18n() {
  return useContext(I18n);
}
