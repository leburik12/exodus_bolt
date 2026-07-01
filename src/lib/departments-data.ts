// Mock data for Department & Ministry operations.
// Frontend-only: persisted nowhere except runtime memory.

export type DepartmentId =
  | "choir" | "evangelism" | "kindness" | "deacons" | "music" | "family"
  | "children" | "youth" | "media" | "deep-thinkers" | "prayer"
  | "technology" | "cell-group";

export type Department = {
  id: DepartmentId;
  code: string;
  name: { en: string; am: string };
  category: { en: string; am: string };
  mission: { en: string; am: string };
  vision: { en: string; am: string };
  description: { en: string; am: string };
  status: "Active" | "Restructuring" | "Paused";
  createdAt: string;
  pastorSupervisor: string;
  leader: string;
  assistantLeader: string;
  secretary: string;
  treasurer?: string;
  members: number;
  maxMembers: number;
  meetingFrequency: { en: string; am: string };
  health: number; // 0–100
  attendance: number; // 0–100
  pendingAgendas: number;
  upcomingSessions: number;
  openTasks: number;
  kpis: { key: string; label: { en: string; am: string }; value: number; unit?: string; trend: number }[];
  accent: string; // tailwind class
};

const d = (
  id: DepartmentId, code: string, en: string, am: string,
  catEn: string, catAm: string, accent: string,
  leader: string, assist: string, sec: string, pastor: string,
  members: number, max: number, freqEn: string, freqAm: string,
  health: number, attendance: number, pending: number, upcoming: number, tasks: number,
  missionEn: string, missionAm: string,
  visionEn: string, visionAm: string,
  descEn: string, descAm: string,
  kpis: Department["kpis"],
  treasurer?: string,
): Department => ({
  id, code,
  name: { en, am },
  category: { en: catEn, am: catAm },
  mission: { en: missionEn, am: missionAm },
  vision: { en: visionEn, am: visionAm },
  description: { en: descEn, am: descAm },
  status: "Active",
  createdAt: "2022-04-17",
  pastorSupervisor: pastor,
  leader, assistantLeader: assist, secretary: sec, treasurer,
  members, maxMembers: max,
  meetingFrequency: { en: freqEn, am: freqAm },
  health, attendance, pendingAgendas: pending, upcomingSessions: upcoming, openTasks: tasks,
  kpis, accent,
});

const k = (key: string, en: string, am: string, value: number, trend: number, unit?: string) =>
  ({ key, label: { en, am }, value, unit, trend });

export const departments: Department[] = [
  d("choir", "CHR", "Choir", "የመዘምራን ቡድን", "Worship", "አምልኮ", "amber",
    "Selamawit Bekele", "Henok Tadesse", "Mihret Alemu", "Pst. Daniel Bekele",
    62, 80, "Twice weekly", "በሳምንት ሁለቴ", 88, 91, 2, 5, 7,
    "Lead the body of Christ into Spirit-filled worship.", "የክርስቶስን አካል ወደ መንፈሳዊ አምልኮ መምራት።",
    "A worship culture that ushers in heaven on earth.", "በመንፈሳዊ አምልኮ ሰማይን በምድር ላይ ማውረድ።",
    "Vocal teams, sectional leads, rehearsal cadence, and Sunday rotation.", "የድምፅ ቡድኖች፣ የክፍል መሪዎች፣ ልምምድ እና የእሁድ መርሐ ግብር።",
    [
      k("rehearsals", "Rehearsals Conducted", "የተደረጉ ልምምዶች", 24, 4),
      k("avg_att", "Avg Rehearsal Attendance", "አማካይ ተገኝነት", 91, 3, "%"),
      k("songs_prep", "Songs Prepared", "የተዘጋጁ መዝሙሮች", 38, 6),
      k("songs_pres", "Songs Presented", "የቀረቡ መዝሙሮች", 27, 5),
      k("new_members", "New Choir Members", "አዲስ አባላት", 4, 1),
      k("events", "Events Participated", "በዝግጅት ተሳትፎ", 9, 2),
    ], "Yodit Mengistu"),

  d("evangelism", "EVN", "Evangelism", "ወንጌላዊነት", "Outreach", "የውጪ አገልግሎት", "rose",
    "Abel Kassahun", "Liya Worku", "Tigist Hailu", "Pst. Samuel Girma",
    74, 120, "Weekly + field days", "በሳምንት + የመስክ ቀናት", 82, 78, 3, 7, 12,
    "Reach every soul in our city with the gospel.", "በከተማችን ላሉ ነፍሳት ሁሉ ወንጌልን ማድረስ።",
    "A church without walls — disciples making disciples.", "ግድግዳ የለሽ ቤተክርስቲያን - ደቀመዛሙርት ደቀመዛሙርትን ይሠራሉ።",
    "Field teams, follow-up calls, conversion tracking, partner ministries.", "የመስክ ቡድኖች፣ ክትትል ጥሪዎች፣ የለውጥ ክትትል፣ አጋር አገልግሎቶች።",
    [
      k("outreach", "Outreach Activities", "የውጪ እንቅስቃሴዎች", 18, 3),
      k("reached", "People Reached", "የተደረሰላቸው", 1240, 220),
      k("visitors", "New Visitors Brought", "አዲስ ጎብኝዎች", 86, 14),
      k("converts", "New Converts", "አዲስ የተለወጡ", 31, 6),
      k("followup", "Follow-up Completion", "የክትትል ማጠናቀቅ", 73, 4, "%"),
      k("engagement", "Community Engagement", "ማህበረሰብ ተሳትፎ", 68, 5, "%"),
    ]),

  d("kindness", "KND", "Acts of Kindness", "የቸርነት ሥራ", "Mercy", "ምሕረት", "emerald",
    "Mekdes Tilahun", "Robel Adane", "Hana Yohannes", "Pst. Bethlehem Kebede",
    41, 60, "Weekly distribution", "ሳምንታዊ ስርጭት", 90, 86, 1, 4, 5,
    "Show Christ's love through tangible acts.", "የክርስቶስን ፍቅር በተግባር ማሳየት።",
    "A church known by its compassion.", "በምሕረቷ የምትታወቅ ቤተክርስቲያን።",
    "Charity drives, distribution logistics, partner orgs, recipient registry.", "የቸርነት እንቅስቃሴ፣ ስርጭት፣ አጋር ድርጅቶች።",
    [
      k("charity", "Charity Activities", "የቸርነት እንቅስቃሴዎች", 16, 3),
      k("helped", "Individuals Helped", "የተረዱ ሰዎች", 412, 64),
      k("donations", "Donations Distributed", "የተሰራጩ ስጦታዎች", 184000, 22000, "ETB"),
      k("volunteers", "Volunteer Participation", "የበጎ ፈቃደኞች ተሳትፎ", 82, 6, "%"),
      k("impact", "Community Impact Score", "ማህበረሰብ ተጽዕኖ ነጥብ", 79, 4),
    ]),

  d("deacons", "DCN", "Deacons & Protocols", "ዲያቆናት እና ፕሮቶኮል", "Operations", "አሰራር", "sky",
    "Yonas Mulu", "Eyerusalem Asfaw", "Bereket Tola", "Pst. Daniel Bekele",
    34, 40, "Every service", "በየአገልግሎቱ", 93, 96, 0, 6, 3,
    "Serve God's house with order and honor.", "የእግዚአብሔርን ቤት በሥርዓትና በክብር ማገልገል።",
    "Excellence in hospitality and stewardship.", "በመቀበል እና በአስተዳደር በላቀ ደረጃ።",
    "Ushers, communion prep, visitor flow, dignitary handling.", "አስተናጋጆች፣ የቅዱስ ቁርባን ዝግጅት፣ የጎብኝ አስተናጋጅነት።",
    [
      k("services", "Services Supported", "የተደገፉ አገልግሎቶች", 48, 2),
      k("visitor_rate", "Visitor Handling Rate", "የጎብኝ አስተናጋጅነት", 96, 2, "%"),
      k("events", "Event Support", "ዝግጅት ድጋፍ", 22, 3),
      k("readiness", "Service Readiness", "የአገልግሎት ዝግጁነት", 94, 1),
      k("attendance", "Team Attendance", "የቡድን ተገኝነት", 96, 2, "%"),
    ]),

  d("music", "SND", "Music / Sound System", "ሙዚቃ / የድምፅ ስርዓት", "Technical", "ቴክኒካዊ", "violet",
    "Nahom Asefa", "Saron Kifle", "Dawit Belay", "Pst. Samuel Girma",
    18, 25, "Pre-service + rehearsal", "ከአገልግሎት በፊት + ልምምድ", 84, 88, 1, 3, 4,
    "Deliver clarity so the Word and worship are unhindered.", "ቃሉና አምልኮ ሳይተጓጎል እንዲደርስ ግልፅነት መስጠት።",
    "Production excellence that disappears.", "ራሱን የማይታየው ላቀ ምርት።",
    "FoH, monitors, in-ear systems, streaming bridge, equipment registry.", "ድምፅ ስርዓት፣ ሞኒተር፣ የመስመር ስርጭት።",
    [
      k("issues", "Issues Resolved", "የተፈቱ ችግሮች", 27, 4),
      k("uptime", "Equipment Uptime", "የመሣሪያ ጊዜ", 98, 1, "%"),
      k("prep", "Service Prep Completion", "የአገልግሎት ዝግጅት", 95, 2, "%"),
      k("incidents", "Technical Incidents", "ቴክኒካዊ ችግሮች", 3, -1),
      k("success", "Event Support Success", "የዝግጅት ድጋፍ ስኬት", 92, 3, "%"),
    ]),

  d("family", "FAM", "Family", "ቤተሰብ", "Discipleship", "ደቀመዝሙርነት", "amber",
    "Pst. Bethlehem Kebede", "Yosef Tegegn", "Marta Wolde", "Pst. Daniel Bekele",
    96, 200, "Monthly + counseling slots", "በወር + አማካሪ ሰዓታት", 81, 74, 2, 4, 8,
    "Build God-honoring families across all stages of life.", "በሁሉም የህይወት ደረጃ እግዚአብሔርን የሚያከብር ቤተሰብ መገንባት።",
    "Generationally healthy households.", "ከትውልድ ወደ ትውልድ የተባረከ ቤት።",
    "Marriage prep, counseling, parenting cohorts, household visitation.", "የጋብቻ ዝግጅት፣ አማካሪ፣ የወላጅነት ቡድኖች።",
    [
      k("meetings", "Family Meetings", "የቤተሰብ ስብሰባዎች", 12, 2),
      k("families", "Families Participating", "የተሳተፉ ቤተሰቦች", 64, 8),
      k("counseling", "Counseling Sessions", "አማካሪ ስብሰባዎች", 28, 5),
      k("events_att", "Family Event Attendance", "የዝግጅት ተገኝነት", 78, 4, "%"),
      k("growth", "Family Growth Rate", "የቤተሰብ እድገት", 9, 2, "%"),
    ]),

  d("children", "CHD", "Children", "ህጻናት", "Discipleship", "ደቀመዝሙርነት", "rose",
    "Rahel Tesfaye", "Kalkidan Solomon", "Mahlet Birhanu", "Pst. Bethlehem Kebede",
    52, 120, "Weekly", "ሳምንታዊ", 87, 84, 1, 5, 6,
    "Train up a child in the way they should go.", "ህጻን በሚሄድበት መንገድ አሰልጥነው።",
    "Children who love Jesus and know the Scriptures.", "ኢየሱስን የሚወዱ ህጻናት።",
    "Age-tiered classrooms, curriculum, safety policy, volunteer rotation.", "በዕድሜ የተደራጁ ክፍሎች፣ ስርዓተ ትምህርት፣ የደህንነት ፖሊሲ።",
    [
      k("attendance", "Children Attendance", "የህጻናት ተገኝነት", 84, 3, "%"),
      k("lessons", "Lessons Conducted", "የተሰጡ ትምህርቶች", 36, 4),
      k("participation", "Child Participation", "የህጻን ተሳትፎ", 89, 2, "%"),
      k("new", "New Children Registered", "አዲስ የተመዘገቡ", 11, 3),
      k("volunteers", "Volunteer Participation", "የበጎ ፈቃደኞች", 92, 1, "%"),
    ]),

  d("youth", "YTH", "Youth", "ወጣቶች", "Discipleship", "ደቀመዝሙርነት", "emerald",
    "Mikiyas Demeke", "Hellen Tariku", "Surafel Abebe", "Pst. Samuel Girma",
    138, 250, "Weekly + Friday night", "ሳምንታዊ + የአርብ ምሽት", 85, 79, 4, 8, 14,
    "Raise a generation that ignites cities for Christ.", "ለክርስቶስ ከተሞችን የሚቀጣጥል ትውልድ ማንሳት።",
    "A youth movement that outlives us.", "ከእኛ በላይ የሚቆይ የወጣት እንቅስቃሴ።",
    "Small groups, leadership pipelines, retreats, university chapters.", "ትናንሽ ቡድኖች፣ የመሪነት ስልጠና፣ ጉባኤዎች።",
    [
      k("attendance", "Youth Attendance", "የወጣት ተገኝነት", 79, 4, "%"),
      k("events", "Youth Events", "የወጣት ዝግጅቶች", 14, 3),
      k("new", "New Youth Members", "አዲስ ወጣት አባላት", 23, 6),
      k("training", "Leadership Trainings", "የመሪነት ስልጠናዎች", 7, 1),
      k("retention", "Retention Rate", "የቆይታ መጠን", 82, 2, "%"),
    ]),

  d("media", "MED", "Media", "ሚዲያ", "Communications", "ግንኙነት", "sky",
    "Caleb Yared", "Bezawit Solomon", "Natnael Asfaw", "Pst. Daniel Bekele",
    22, 30, "Weekly + on-demand", "ሳምንታዊ + በፍላጎት", 86, 89, 1, 4, 9,
    "Tell the story of what God is doing.", "እግዚአብሔር የሚሰራውን ታሪክ መንገር።",
    "Every soul reached through every screen.", "በየስክሪኑ ለእያንዳንዱ ነፍስ።",
    "Photo, video, livestream, social, brand library, archive.", "ፎቶ፣ ቪዲዮ፣ ቀጥታ ስርጭት፣ ማህበራዊ ሚዲያ።",
    [
      k("photos", "Photos Produced", "የተዘጋጁ ፎቶዎች", 1240, 180),
      k("videos", "Videos Produced", "የተዘጋጁ ቪዲዮዎች", 36, 8),
      k("livestream", "Livestream Sessions", "ቀጥታ ስርጭቶች", 24, 2),
      k("posts", "Posts Published", "የታተሙ ይዘቶች", 142, 22),
      k("engagement", "Audience Engagement", "የተመልካች ተሳትፎ", 11, 2, "%"),
    ]),

  d("deep-thinkers", "DPT", "Deep Thinkers", "ጥልቅ አሳቢዎች", "Research", "ምርምር", "violet",
    "Dr. Tewodros Yilma", "Eden Asrat", "Yared Mengesha", "Pst. Samuel Girma",
    14, 20, "Bi-weekly", "በሁለት ሳምንት", 78, 81, 2, 2, 6,
    "Apply rigorous thought to ministry questions.", "ለአገልግሎት ጥያቄዎች ጥልቅ አስተሳሰብ መተግበር።",
    "An intellectually credible witness.", "በምክንያት የሚታመን ምስክርነት።",
    "Apologetics, research papers, innovation backlog, theology reviews.", "የእምነት መከላከያ፣ የምርምር ሰነድ፣ የፈጠራ ሐሳቦች።",
    [
      k("research", "Research Topics", "የምርምር ርዕሶች", 8, 2),
      k("studies", "Bible Study Sessions", "የመጽሐፍ ቅዱስ ጥናቶች", 12, 1),
      k("proposals", "Innovation Proposals", "የፈጠራ ሐሳቦች", 5, 2),
      k("content", "Educational Content", "ትምህርታዊ ይዘት", 18, 4),
      k("approved", "Approved Recommendations", "የተፈቀዱ ምክሮች", 4, 1),
    ]),

  d("prayer", "PRY", "Prayer Team", "የጸሎት ቡድን", "Intercession", "ምልጃ", "amber",
    "Genet Worku", "Sintayehu Belete", "Helen Tadele", "Pst. Bethlehem Kebede",
    47, 80, "Daily + night watch", "በየቀኑ + የሌሊት ጥበቃ", 92, 88, 0, 6, 4,
    "Keep the altar burning night and day.", "መሰዊያውን ቀንና ሌት ይቆያል።",
    "A house of prayer for all nations.", "ለሁሉም ህዝቦች የጸሎት ቤት።",
    "24/7 schedule, intercession requests, watch teams, prayer wall.", "የ24/7 መርሐ ግብር፣ ምልጃ፣ የጸሎት ግድግዳ።",
    [
      k("meetings", "Prayer Meetings", "የጸሎት ስብሰባዎች", 88, 6),
      k("requests", "Requests Processed", "የተሰሩ ጥያቄዎች", 412, 56),
      k("participation", "Participation Rate", "የተሳትፎ መጠን", 84, 3, "%"),
      k("followup", "Follow-up Completed", "የተጠናቀቀ ክትትል", 76, 4, "%"),
    ]),

  d("technology", "TEC", "Technology", "ቴክኖሎጂ", "Operations", "አሰራር", "sky",
    "Eyob Tesfaye", "Mahder Yonas", "Kirubel Hailu", "Pst. Daniel Bekele",
    11, 18, "Weekly standup", "ሳምንታዊ", 89, 92, 1, 3, 7,
    "Build digital infrastructure for ministry at scale.", "ለአገልግሎት የሚሆን ዲጂታል መሠረተ ልማት መገንባት።",
    "Tools that disappear so ministry shines.", "ራሳቸውን የሚደብቁ መሣሪያዎች።",
    "Platform engineering, integrations, security, support tickets.", "የመድረክ ምሕንድስና፣ ውህደት፣ ደህንነት።",
    [
      k("uptime", "System Uptime", "የስርዓት ቆይታ", 99, 0, "%"),
      k("bugs", "Bugs Fixed", "የተፈቱ ችግሮች", 42, 6),
      k("features", "Features Delivered", "የቀረቡ ባህሪያት", 18, 4),
      k("tickets", "Tickets Resolved", "የተፈቱ ጥያቄዎች", 67, 9),
      k("perf", "Platform Performance", "የመድረክ አፈጻጸም", 94, 2),
    ]),

  d("cell-group", "CEL", "Cell Group", "የሕዋስ ቡድን", "Discipleship", "ደቀመዝሙርነት", "rose",
    "Pst. Samuel Girma", "Tsion Abraham", "Biruk Wolde", "Pst. Daniel Bekele",
    312, 600, "Weekly home cells", "ሳምንታዊ የቤት ሕዋስ", 83, 76, 3, 12, 18,
    "Every member in a cell, every cell multiplying.", "እያንዳንዱ አባል በሕዋስ፣ እያንዳንዱ ሕዋስ ይባዛል።",
    "A city covered by cells of light.", "በብርሃን ሕዋሳት የተሸፈነ ከተማ።",
    "Cells across zones, leader pipeline, multiplication cadence.", "በዞን የተደራጁ ሕዋሳት፣ የመሪ ፈሰስ።",
    [
      k("meetings", "Cell Meetings", "የሕዋስ ስብሰባዎች", 168, 14),
      k("attendance", "Cell Attendance", "የሕዋስ ተገኝነት", 76, 3, "%"),
      k("new", "New Members Added", "አዲስ የተጨመሩ", 48, 9),
      k("requests", "Prayer Requests", "የጸሎት ጥያቄዎች", 224, 28),
      k("retention", "Retention Rate", "የቆይታ መጠን", 88, 2, "%"),
    ]),
];

export type Session = {
  id: string; dept: DepartmentId; title: string; type: string;
  date: string; time: string; location: string; lead: string; status: "Scheduled" | "Completed" | "Cancelled";
};

export const sessions: Session[] = [
  { id: "S-9001", dept: "choir", title: "Sunday Set Rehearsal", type: "Rehearsal", date: "2025-11-22", time: "18:00", location: "Sanctuary B", lead: "Selamawit Bekele", status: "Scheduled" },
  { id: "S-9002", dept: "evangelism", title: "Bole Field Outreach", type: "Outreach", date: "2025-11-23", time: "09:00", location: "Bole Roundabout", lead: "Abel Kassahun", status: "Scheduled" },
  { id: "S-9003", dept: "youth", title: "Friday Night Live", type: "Weekly Meeting", date: "2025-11-21", time: "19:30", location: "Youth Hall", lead: "Mikiyas Demeke", status: "Scheduled" },
  { id: "S-9004", dept: "prayer", title: "Night Watch · Tier 3", type: "Prayer Session", date: "2025-11-20", time: "23:00", location: "Prayer Room", lead: "Genet Worku", status: "Completed" },
  { id: "S-9005", dept: "children", title: "Sunday Curriculum", type: "Weekly Meeting", date: "2025-11-23", time: "09:30", location: "Kids Wing", lead: "Rahel Tesfaye", status: "Scheduled" },
  { id: "S-9006", dept: "media", title: "Livestream Run-of-Show", type: "Training", date: "2025-11-22", time: "16:00", location: "Control Room", lead: "Caleb Yared", status: "Scheduled" },
  { id: "S-9007", dept: "deacons", title: "Visitor Flow Briefing", type: "Training", date: "2025-11-23", time: "08:30", location: "Lobby", lead: "Yonas Mulu", status: "Scheduled" },
];

export type Agenda = {
  id: string; dept: DepartmentId; topic: string; submittedBy: string; submittedAt: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected" | "Revision Requested";
  budget: number; purpose: string;
};

export const agendas: Agenda[] = [
  { id: "A-2401", dept: "evangelism", topic: "Q1 City-Wide Outreach Wave", submittedBy: "Abel Kassahun", submittedAt: "2025-11-18", priority: "High", status: "Under Review", budget: 48000, purpose: "Reach 5,000 souls across 4 zones" },
  { id: "A-2402", dept: "media", topic: "Livestream Encoder Upgrade", submittedBy: "Caleb Yared", submittedAt: "2025-11-17", priority: "Medium", status: "Submitted", budget: 92000, purpose: "Replace failing H.264 encoder" },
  { id: "A-2403", dept: "family", topic: "Marriage Intensive Retreat", submittedBy: "Pst. Bethlehem Kebede", submittedAt: "2025-11-15", priority: "High", status: "Approved", budget: 215000, purpose: "Two-day off-site for 40 couples" },
  { id: "A-2404", dept: "youth", topic: "University Chapter Launch", submittedBy: "Mikiyas Demeke", submittedAt: "2025-11-14", priority: "Critical", status: "Revision Requested", budget: 67000, purpose: "AAU + Addis Ababa Science & Technology" },
  { id: "A-2405", dept: "choir", topic: "Christmas Cantata Production", submittedBy: "Selamawit Bekele", submittedAt: "2025-11-12", priority: "High", status: "Approved", budget: 78000, purpose: "Original score + 80-voice ensemble" },
  { id: "A-2406", dept: "kindness", topic: "Winter Blanket Drive", submittedBy: "Mekdes Tilahun", submittedAt: "2025-11-19", priority: "Medium", status: "Submitted", budget: 124000, purpose: "1,200 blankets across 6 kebeles" },
  { id: "A-2407", dept: "cell-group", topic: "Leader Multiplication Cohort", submittedBy: "Tsion Abraham", submittedAt: "2025-11-10", priority: "High", status: "Under Review", budget: 36000, purpose: "Train 24 new cell leaders" },
];

export type Task = {
  id: string; dept: DepartmentId; title: string; assignedTo: string; due: string;
  priority: "Low" | "Medium" | "High"; status: "Pending" | "In Progress" | "Completed" | "Delayed";
};

export const tasks: Task[] = [
  { id: "T-501", dept: "choir", title: "Distribute soprano sheet music", assignedTo: "Henok Tadesse", due: "2025-11-21", priority: "Medium", status: "In Progress" },
  { id: "T-502", dept: "evangelism", title: "Confirm Bole permits", assignedTo: "Liya Worku", due: "2025-11-22", priority: "High", status: "Pending" },
  { id: "T-503", dept: "media", title: "Test new lavalier mics", assignedTo: "Natnael Asfaw", due: "2025-11-20", priority: "Medium", status: "Completed" },
  { id: "T-504", dept: "youth", title: "Mentor onboarding packets", assignedTo: "Hellen Tariku", due: "2025-11-23", priority: "Medium", status: "Delayed" },
  { id: "T-505", dept: "prayer", title: "Tier-3 watch sign-ups", assignedTo: "Sintayehu Belete", due: "2025-11-20", priority: "High", status: "In Progress" },
  { id: "T-506", dept: "kindness", title: "Inventory current blanket stock", assignedTo: "Hana Yohannes", due: "2025-11-21", priority: "Low", status: "Completed" },
];

export const getDepartment = (id: string) => departments.find((x) => x.id === id);

// ============================================================
// Department workspace extensions
// Plans · Members · Attendance · Resource Requests · Documents · Activity
// ============================================================

export type Plan = {
  id: string; dept: DepartmentId;
  title: { en: string; am: string };
  description: { en: string; am: string };
  goal: { en: string; am: string };
  startDate: string; endDate: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  owner: string;
  status: "Draft" | "Active" | "Completed" | "Delayed" | "Archived";
  progress: number; // 0-100
  objectives: { id: string; title: { en: string; am: string }; progress: number; due: string; owner: string }[];
};

export type DeptMember = {
  id: string; dept: DepartmentId; name: string; role: string;
  skills: string[]; joinDate: string; attendanceRate: number;
  status: "Active" | "Probation" | "Inactive";
  initials: string;
};

export type AttendanceRef =
  | "Department Session" | "Event" | "Service" | "Cell Group"
  | "Training" | "Conference" | "Rehearsal" | "Prayer Meeting";

export type AttendanceRecord = {
  id: string;
  referenceType: AttendanceRef;
  referenceId: string;
  dept: DepartmentId;
  memberId: string;
  memberName: string;
  checkIn: string; checkOut?: string;
  status: "Present" | "Late" | "Absent" | "Excused";
  method: "QR Code" | "Face Recognition" | "GPS" | "Manual" | "NFC" | "Self Check-in";
  notes?: string;
};

export type ResourceRequest = {
  id: string; dept: DepartmentId;
  type: { en: string; am: string };
  amount: number; reason: { en: string; am: string };
  status: "Submitted" | "Under Review" | "Approved" | "Rejected";
  submittedBy: string; submittedAt: string;
  attachments: number;
};

export type DeptDocument = {
  id: string; dept: DepartmentId;
  title: { en: string; am: string };
  type: "PDF" | "Image" | "Video" | "Sheet" | "Doc";
  size: string;
  uploadedBy: string; uploadedAt: string;
};

export type ActivityEntry = {
  id: string; dept: DepartmentId;
  at: string; actor: string;
  action: { en: string; am: string };
  kind: "create" | "update" | "approve" | "attendance" | "task" | "agenda" | "member";
};

// Deterministic mock generators keyed by department id
const _seed = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return () => {
    h = (h * 9301 + 49297) % 233280;
    return h / 233280;
  };
};

const _names = [
  ["Selamawit B.", "SB"], ["Henok T.", "HT"], ["Mekdes A.", "MA"], ["Yonas M.", "YM"],
  ["Tigist H.", "TH"], ["Abel K.", "AK"], ["Liya W.", "LW"], ["Bereket T.", "BT"],
  ["Eden A.", "EA"], ["Caleb Y.", "CY"], ["Mahder Y.", "MY"], ["Rahel T.", "RT"],
  ["Kalkidan S.", "KS"], ["Mikiyas D.", "MD"], ["Hellen T.", "HE"], ["Robel A.", "RA"],
];

const _skillsPool = ["Leadership", "Music", "Tech", "Teaching", "Counseling", "Logistics", "Design", "Writing", "Driving", "Hospitality", "Translation", "Mentoring"];

export const getDeptMembers = (dept: DepartmentId): DeptMember[] => {
  const rand = _seed(dept + "members");
  const count = 12;
  return Array.from({ length: count }, (_, i) => {
    const [name, init] = _names[i % _names.length];
    const skills = Array.from({ length: 2 + Math.floor(rand() * 2) }, () => _skillsPool[Math.floor(rand() * _skillsPool.length)]);
    return {
      id: `${dept.toUpperCase().slice(0, 3)}-M${1000 + i}`,
      dept, name, initials: init,
      role: i === 0 ? "Lead" : i === 1 ? "Assistant" : i === 2 ? "Secretary" : "Member",
      skills: Array.from(new Set(skills)),
      joinDate: `2024-${String(1 + (i % 11)).padStart(2, "0")}-${String(1 + (i % 27)).padStart(2, "0")}`,
      attendanceRate: 60 + Math.floor(rand() * 38),
      status: i % 7 === 0 ? "Probation" : i % 11 === 0 ? "Inactive" : "Active",
    };
  });
};

export const getDeptPlans = (dept: DepartmentId): Plan[] => {
  const rand = _seed(dept + "plans");
  const tpls: { en: string; am: string }[] = [
    { en: "Q1 Operational Plan", am: "የ1ኛ ሩብ አመት እቅድ" },
    { en: "Quarterly Outreach Plan", am: "የሩብ አመት የውጪ እንቅስቃሴ" },
    { en: "Annual Discipleship Plan", am: "ዓመታዊ የደቀመዝሙር እቅድ" },
  ];
  return tpls.map((t, i) => ({
    id: `${dept.toUpperCase().slice(0, 3)}-P${100 + i}`,
    dept,
    title: t,
    description: { en: "Coordinated execution plan with milestones and accountability.", am: "ከደረጃዎች ጋር የተቀናጀ የማስፈጸሚያ እቅድ።" },
    goal: { en: "Achieve measurable kingdom impact.", am: "የሚለካ የመንግሥት ተጽዕኖ ማግኘት።" },
    startDate: `2025-${String(1 + i * 3).padStart(2, "0")}-01`,
    endDate: `2025-${String(3 + i * 3).padStart(2, "0")}-28`,
    priority: (["High", "Medium", "Critical"] as const)[i % 3],
    owner: _names[i % _names.length][0],
    status: (["Active", "Active", "Draft"] as const)[i],
    progress: 20 + Math.floor(rand() * 70),
    objectives: Array.from({ length: 3 }, (_, j) => ({
      id: `${dept}-P${100 + i}-O${j + 1}`,
      title: {
        en: ["Recruit & onboard team", "Launch flagship initiative", "Measure & report KPIs"][j],
        am: ["ቡድኑን መመልመል", "ዋና ተግባር ማስጀመር", "ጠቋሚዎችን መለካት"][j],
      },
      progress: Math.floor(rand() * 100),
      due: `2025-${String(2 + i * 3 + j).padStart(2, "0")}-15`,
      owner: _names[(i + j) % _names.length][0],
    })),
  }));
};

export const getDeptAttendance = (dept: DepartmentId): AttendanceRecord[] => {
  const rand = _seed(dept + "att");
  const refs: AttendanceRef[] = ["Department Session", "Rehearsal", "Prayer Meeting", "Training"];
  const statuses = ["Present", "Present", "Present", "Late", "Excused", "Absent"] as const;
  const methods = ["QR Code", "Face Recognition", "Manual", "Self Check-in", "NFC"] as const;
  const members = getDeptMembers(dept);
  return Array.from({ length: 10 }, (_, i) => ({
    id: `${dept.toUpperCase().slice(0, 3)}-A${5000 + i}`,
    referenceType: refs[i % refs.length],
    referenceId: `REF-${9000 + Math.floor(rand() * 200)}`,
    dept,
    memberId: members[i % members.length].id,
    memberName: members[i % members.length].name,
    checkIn: `2025-11-${String(10 + (i % 12)).padStart(2, "0")} ${String(17 + (i % 4)).padStart(2, "0")}:${i % 2 === 0 ? "02" : "47"}`,
    status: statuses[i % statuses.length],
    method: methods[i % methods.length],
  }));
};

export const getDeptResourceRequests = (dept: DepartmentId): ResourceRequest[] => {
  const tpls: { en: string; am: string }[] = [
    { en: "Equipment", am: "መሣሪያ" },
    { en: "Materials", am: "ቁሳቁስ" },
    { en: "Transport", am: "መጓጓዣ" },
    { en: "Venue Booking", am: "የቦታ መያዣ" },
  ];
  return tpls.map((t, i) => ({
    id: `${dept.toUpperCase().slice(0, 3)}-R${300 + i}`,
    dept, type: t,
    amount: (i + 1) * 12500,
    reason: { en: "Support upcoming session and outreach logistics.", am: "ቀጣይ ስብሰባና አገልግሎትን ለመደገፍ።" },
    status: (["Submitted", "Under Review", "Approved", "Rejected"] as const)[i],
    submittedBy: _names[i % _names.length][0],
    submittedAt: `2025-11-${String(8 + i * 2).padStart(2, "0")}`,
    attachments: i,
  }));
};

export const getDeptDocuments = (dept: DepartmentId): DeptDocument[] => {
  const tpls: { en: string; am: string; type: DeptDocument["type"] }[] = [
    { en: "Meeting Minutes — November", am: "የስብሰባ ቃለ ጉባኤ — ኖቬምበር", type: "PDF" },
    { en: "Training Slide Deck", am: "የስልጠና ስላይድ", type: "Doc" },
    { en: "Session Photos", am: "የስብሰባ ፎቶዎች", type: "Image" },
    { en: "Strategy Whitepaper", am: "የስትራቴጂ ሰነድ", type: "PDF" },
    { en: "Sermon Reference Sheet", am: "የስብከት ማመሳከሪያ", type: "Sheet" },
    { en: "Event Highlights Reel", am: "የዝግጅት ቪዲዮ", type: "Video" },
  ];
  return tpls.map((t, i) => ({
    id: `${dept.toUpperCase().slice(0, 3)}-D${800 + i}`,
    dept,
    title: { en: t.en, am: t.am },
    type: t.type,
    size: `${(0.4 + i * 1.7).toFixed(1)} MB`,
    uploadedBy: _names[i % _names.length][0],
    uploadedAt: `2025-11-${String(2 + i * 3).padStart(2, "0")}`,
  }));
};

export const getDeptActivity = (dept: DepartmentId): ActivityEntry[] => {
  const acts: { en: string; am: string; kind: ActivityEntry["kind"] }[] = [
    { en: "Session created · Sunday Set Rehearsal", am: "ስብሰባ ተፈጥሯል · የእሁድ ልምምድ", kind: "create" },
    { en: "New member onboarded", am: "አዲስ አባል ተቀላቅሏል", kind: "member" },
    { en: "Agenda submitted for pastoral review", am: "አጀንዳ ለፓስተር ቀርቧል", kind: "agenda" },
    { en: "Attendance recorded · 24 present, 3 absent", am: "ተገኝነት ተመዝግቧል · 24 ተገኝቷል፣ 3 አልተገኘም", kind: "attendance" },
    { en: "Task marked complete", am: "ተግባር ተጠናቋል", kind: "task" },
    { en: "Plan progress updated to 64%", am: "የእቅድ እድገት 64% ደርሷል", kind: "update" },
    { en: "Resource request approved", am: "የመሣሪያ ጥያቄ ጸድቋል", kind: "approve" },
    { en: "Document uploaded · Meeting minutes", am: "ሰነድ ተጨምሯል · ቃለ ጉባኤ", kind: "create" },
  ];
  return acts.map((a, i) => ({
    id: `${dept.toUpperCase().slice(0, 3)}-AC${600 + i}`,
    dept,
    at: `2025-11-${String(22 - i).padStart(2, "0")} ${String(8 + (i % 10)).padStart(2, "0")}:${i % 2 === 0 ? "12" : "47"}`,
    actor: _names[i % _names.length][0],
    action: { en: a.en, am: a.am },
    kind: a.kind,
  }));
};
