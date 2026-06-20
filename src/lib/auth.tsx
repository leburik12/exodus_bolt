import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "pastor" | "admin" | "cell_leader" | "member";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type Stored = AuthUser & { passwordHash: string };

type Ctx = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (input: { name: string; email: string; password: string; role: Role }) => Promise<AuthUser>;
  requestReset: (email: string) => Promise<string>;
  confirmReset: (email: string, token: string, password: string) => Promise<void>;
  logout: () => void;
};

const KEY_USERS = "zetseat.auth.users";
const KEY_SESSION = "zetseat.auth.session";
const KEY_RESETS = "zetseat.auth.resets";

const Auth = createContext<Ctx>(null as unknown as Ctx);

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return String(h);
}
function readUsers(): Stored[] {
  try { return JSON.parse(localStorage.getItem(KEY_USERS) || "[]"); } catch { return []; }
}
function writeUsers(u: Stored[]) { localStorage.setItem(KEY_USERS, JSON.stringify(u)); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY_SESSION);
      if (s) setUser(JSON.parse(s));
    } catch { /* noop */ }
    setReady(true);
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(KEY_SESSION, JSON.stringify(u));
    else localStorage.removeItem(KEY_SESSION);
  };

  const login: Ctx["login"] = async (email) => {
    const cleanEmail = email.trim() || "demo@zetseat.local";
    const users = readUsers();
    const u = users.find((x) => x.email.toLowerCase() === cleanEmail.toLowerCase());
    const pub: AuthUser = u
      ? { id: u.id, name: u.name, email: u.email, role: u.role }
      : {
          id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
          name: cleanEmail.includes("@") ? cleanEmail.split("@")[0].replace(/[._-]+/g, " ") : "Demo Operator",
          email: cleanEmail,
          role: "admin",
        };
    persist(pub);
    return pub;
  };

  const signup: Ctx["signup"] = async ({ name, email, password, role }) => {
    const users = readUsers();
    if (users.find((x) => x.email.toLowerCase() === email.toLowerCase()))
      throw new Error("An account with this email already exists.");
    const u: Stored = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      name, email, role,
      passwordHash: hash(password),
    };
    users.push(u);
    writeUsers(users);
    const pub: AuthUser = { id: u.id, name: u.name, email: u.email, role: u.role };
    persist(pub);
    return pub;
  };

  const requestReset: Ctx["requestReset"] = async (email) => {
    const users = readUsers();
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u) throw new Error("No account found for this email.");
    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    const map = JSON.parse(localStorage.getItem(KEY_RESETS) || "{}");
    map[email.toLowerCase()] = token;
    localStorage.setItem(KEY_RESETS, JSON.stringify(map));
    return token;
  };

  const confirmReset: Ctx["confirmReset"] = async (email, token, password) => {
    const map = JSON.parse(localStorage.getItem(KEY_RESETS) || "{}");
    if (map[email.toLowerCase()] !== token) throw new Error("Invalid or expired reset code.");
    const users = readUsers();
    const idx = users.findIndex((x) => x.email.toLowerCase() === email.toLowerCase());
    if (idx < 0) throw new Error("Account not found.");
    users[idx].passwordHash = hash(password);
    writeUsers(users);
    delete map[email.toLowerCase()];
    localStorage.setItem(KEY_RESETS, JSON.stringify(map));
  };

  const logout = () => persist(null);

  return (
    <Auth.Provider value={{ user, ready, login, signup, requestReset, confirmReset, logout }}>
      {children}
    </Auth.Provider>
  );
}

export function useAuth() {
  return useContext(Auth);
}

export const ROLE_LABELS: Record<Role, { en: string; am: string }> = {
  pastor: { en: "Pastor", am: "ፓስተር" },
  admin: { en: "Membership Administrator", am: "የአባልነት አስተዳዳሪ" },
  cell_leader: { en: "Cell Leader", am: "የሕዋስ መሪ" },
  member: { en: "Member", am: "አባል" },
};
