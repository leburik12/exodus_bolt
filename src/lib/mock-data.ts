// Production-grade mock data for Zetseat CHMS

export type Member = {
  id: string;
  uuid: string;
  name: string;
  nameAm: string;
  email: string;
  phone: string;
  gender: "Male" | "Female";
  maritalStatus: "Single" | "Married" | "Widowed" | "Engaged";
  occupation: string;
  cellGroup: string;
  cellLeader: string;
  zone: string;
  address: string;
  conversionDate: string;
  joinedDate: string;
  emergency: { name: string; phone: string };
  gifts: { name: string; match: number }[];
  avatar: string;
  bio: string;
};

const avatars = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500834375145-7e9c08b9b8c2?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1592621385612-4d7129426394?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=160&h=160&fit=crop&crop=faces",
];

const giftTaxonomy = [
  "Leadership", "Teaching", "Encouragement", "Discernment",
  "Administration", "Prophecy", "Hospitality", "Mercy",
  "Evangelism", "Shepherding", "Wisdom", "Faith",
];

const occupations = [
  "Senior Infrastructure Engineer", "Neurosurgeon", "Civil Engineer",
  "Public Health Officer", "Coffee Exporter", "Bank Branch Manager",
  "Pediatrician", "Aviation Mechanic", "Software Architect",
  "Microfinance Officer", "Hotel Operations Lead", "Logistics Director",
  "Litigation Attorney", "Dental Surgeon", "ML Research Scientist",
  "Construction Project Manager", "UX Researcher", "Pharmacist",
  "Backend Engineer", "Data Analyst", "Marketing Director",
  "Operations Manager", "Architect", "Investment Analyst",
];

const firstNames = [
  "Akilu", "Bethel", "Selam", "Yonas", "Hana", "Daniel", "Mahlet", "Samuel",
  "Lidya", "Kaleb", "Ruth", "Henok", "Tigist", "Robel", "Eden", "Abel",
  "Meron", "Bereket", "Saba", "Nahom", "Helen", "Mikiyas", "Rahel", "Solomon",
  "Fitsum", "Hiwot", "Yohannes", "Genet", "Tewodros", "Mulu", "Eyasu", "Aida",
];
const firstNamesAm = [
  "አክሉ", "ቤቴል", "ሰላም", "ዮናስ", "ሐና", "ዳንኤል", "ማህሌት", "ሳሙኤል",
  "ሊድያ", "ካሌብ", "ሩት", "ሄኖክ", "ትዕግስት", "ሮቤል", "ኤደን", "አቤል",
  "ሜሮን", "በረከት", "ሳባ", "ናሆም", "ሄለን", "ሚኪያስ", "ራሄል", "ሰለሞን",
  "ፍፁም", "ህይወት", "ዮሐንስ", "ገነት", "ቴዎድሮስ", "ሙሉ", "ኤያሱ", "አይዳ",
];
const lastNames = [
  "Balcha", "Tesfaye", "Hailu", "Mekonnen", "Girma", "Alemu", "Bekele", "Wolde",
  "Assefa", "Negussie", "Demeke", "Tadesse", "Lemma", "Gebre", "Yilma", "Tola",
];
const lastNamesAm = [
  "ባልቻ", "ተስፋዬ", "ሃይሉ", "መኮንን", "ግርማ", "አለሙ", "በቀለ", "ወልዴ",
  "አሰፋ", "ነጉሴ", "ደመቀ", "ታደሰ", "ለማ", "ገብሬ", "ይልማ", "ቶላ",
];
const cellGroups = ["Alpha-Bole", "Bethel-Megenagna", "Carmel-CMC", "Delta-Kazanchis", "Eden-Sarbet", "Fountain-Gerji"];
const cellLeaders = ["Yared Hailu", "Sara Tesfaye", "Dawit Mekonnen", "Hiwot Girma", "Eyob Alemu", "Tsion Bekele"];
const zones = ["Bole", "Megenagna", "CMC", "Kazanchis", "Sarbet", "Gerji"];

function rand<T>(arr: T[], i: number): T { return arr[i % arr.length]; }
function pad(n: number, w = 4) { return n.toString().padStart(w, "0"); }

const COUNT = 84;

export const members: Member[] = Array.from({ length: COUNT }).map((_, i) => {
  const fnIdx = (i * 3 + 1) % firstNames.length;
  const lnIdx = (i * 5 + 2) % lastNames.length;
  const fn = firstNames[fnIdx];
  const ln = lastNames[lnIdx];
  const cg = rand(cellGroups, i);
  const cgIdx = cellGroups.indexOf(cg);
  const giftA = rand(giftTaxonomy, i * 2);
  const giftB = rand(giftTaxonomy, i * 2 + 7);
  return {
    id: `ZS-${pad(i + 1042)}`,
    uuid: `m_${(i * 2654435761 >>> 0).toString(36)}${i}`,
    name: `${fn} ${ln}`,
    nameAm: `${firstNamesAm[fnIdx]} ${lastNamesAm[lnIdx]}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@zetseat.org`,
    phone: `+251 9${(11000000 + i * 137).toString().slice(0, 8)}`,
    gender: i % 2 === 0 ? "Male" : "Female",
    maritalStatus: (["Single", "Married", "Married", "Engaged", "Widowed"] as const)[i % 5],
    occupation: rand(occupations, i),
    cellGroup: cg,
    cellLeader: cellLeaders[cgIdx],
    zone: zones[cgIdx],
    address: `${rand(zones, i)}, Subcity 0${(i % 9) + 1}, House #${100 + i}`,
    conversionDate: `20${10 + (i % 14)}-0${(i % 9) + 1}-${10 + (i % 18)}`,
    joinedDate: `20${15 + (i % 9)}-0${(i % 9) + 1}-${5 + (i % 22)}`,
    emergency: { name: `${rand(firstNames, i + 4)} ${ln}`, phone: `+251 9${(22000000 + i * 211).toString().slice(0, 8)}` },
    gifts: [
      { name: giftA, match: 80 + (i % 18) },
      { name: giftB, match: 65 + (i % 25) },
    ],
    avatar: avatars[i % avatars.length],
    bio: `${fn} has served the ${cg} cell network since joining, contributing in ${giftA.toLowerCase()} and ${giftB.toLowerCase()} ministries across the ${zones[cgIdx]} corridor.`,
  };
});

export const giftCatalog = giftTaxonomy;
export const cellGroupCatalog = cellGroups;
