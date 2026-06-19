import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Mail, KeyRound, User as UserIcon, ArrowLeft } from "lucide-react";
import { useAuth, ROLE_LABELS, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/zetseat_logo.jpg?url";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in // Zetseat CHMS" },
      { name: "description", content: "Operator console authentication for the Zetseat church management system." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "reset";

function AuthPage() {
  const { user, ready, login, signup, requestReset, confirmReset } = useAuth();
  const { t, lang, setLang } = useI18n();
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // login / signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("member");

  // reset flow
  const [resetStage, setResetStage] = useState<"request" | "confirm">("request");
  const [token, setToken] = useState("");
  const [newPwd, setNewPwd] = useState("");

  useEffect(() => {
    if (ready && user) nav({ to: "/" });
  }, [ready, user, nav]);

  const tt = (k: string, fallback: string) => {
    const v = t(k);
    return v === k ? fallback : v;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setOk(null); setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
        nav({ to: "/" });
      } else if (mode === "signup") {
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        await signup({ name, email, password, role });
        nav({ to: "/" });
      } else if (mode === "reset") {
        if (resetStage === "request") {
          const code = await requestReset(email);
          setOk(`${tt("auth.codeIssued", "Reset code (demo)")}: ${code}`);
          setResetStage("confirm");
        } else {
          if (newPwd.length < 6) throw new Error("Password must be at least 6 characters.");
          await confirmReset(email, token.trim().toUpperCase(), newPwd);
          setOk(tt("auth.resetOk", "Password updated. You can sign in now."));
          setMode("login");
          setResetStage("request");
          setToken(""); setNewPwd("");
        }
      }
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-background text-foreground md:grid-cols-[1.05fr_1fr]">
      {/* LEFT brand pane */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-foreground p-10 text-background md:flex">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Zetseat" className="h-10 w-10 rounded-md ring-1 ring-amber/60" />
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-amber">ZETSEAT // CHMS</div>
            <div className="text-sm font-semibold">Mission-Critical Operations</div>
          </div>
        </div>
        <div className="relative z-10 space-y-5">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-amber">Operator Console v4.2</div>
          <h1 className="text-4xl font-semibold leading-tight">
            Temporal telemetry for the <span className="text-amber">body of Christ</span>.
          </h1>
          <p className="max-w-md text-sm text-background/70">
            Authenticated session required. Roles route to different surface areas of the network — pastoral oversight, membership administration, cell leadership, and member access.
          </p>
          <ul className="mono grid grid-cols-2 gap-2 text-[11px] uppercase tracking-wider text-background/70">
            <li className="rounded border border-background/15 bg-background/5 px-3 py-2">Member Graph</li>
            <li className="rounded border border-background/15 bg-background/5 px-3 py-2">Cell Matrix</li>
            <li className="rounded border border-background/15 bg-background/5 px-3 py-2">Attendance</li>
            <li className="rounded border border-background/15 bg-background/5 px-3 py-2">Talent Engine</li>
          </ul>
        </div>
        <div className="mono flex items-center justify-between text-[10px] uppercase tracking-wider text-background/50">
          <span>Encrypted session · local-only mock auth</span>
          <span>Tigray · Addis Ababa</span>
        </div>
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber/20 blur-3xl" />
      </aside>

      {/* RIGHT form pane */}
      <main className="flex flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {mode === "login" && tt("auth.loginTitle", "Sign In")}
            {mode === "signup" && tt("auth.signupTitle", "Create Operator")}
            {mode === "reset" && tt("auth.resetTitle", "Reset Password")}
          </div>
          <button
            onClick={() => setLang(lang === "en" ? "am" : "en")}
            className="mono rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground hover:bg-amber-soft"
          >
            {lang === "en" ? "አማ" : "EN"}
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center gap-3 md:hidden">
              <img src={logo} alt="Zetseat" className="h-9 w-9 rounded-md ring-1 ring-border" />
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-foreground">ZETSEAT // CHMS</div>
            </div>

            <div className="mb-5 inline-flex rounded-md border border-border bg-surface p-0.5 text-[11px]">
              {(["login", "signup", "reset"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setErr(null); setOk(null); setResetStage("request"); }}
                  className={[
                    "mono rounded px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors",
                    mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {m === "login" && tt("auth.tabLogin", "Login")}
                  {m === "signup" && tt("auth.tabSignup", "Sign Up")}
                  {m === "reset" && tt("auth.tabReset", "Reset")}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-surface p-6">
              {mode === "signup" && (
                <Field icon={<UserIcon className="h-4 w-4" />} label={tt("auth.fullName", "Full Name")}>
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Kirubel Awoke" className={inputCls} />
                </Field>
              )}

              {(mode === "login" || mode === "signup" || mode === "reset") && (
                <Field icon={<Mail className="h-4 w-4" />} label={tt("auth.email", "Email")}>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@zetseat.org"
                    className={inputCls}
                    disabled={mode === "reset" && resetStage === "confirm"}
                  />
                </Field>
              )}

              {(mode === "login" || mode === "signup") && (
                <Field icon={<KeyRound className="h-4 w-4" />} label={tt("auth.password", "Password")}>
                  <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                </Field>
              )}

              {mode === "signup" && (
                <Field icon={<ShieldCheck className="h-4 w-4" />} label={tt("auth.role", "Operator Role")}>
                  <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputCls}>
                    {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r][lang]}</option>
                    ))}
                  </select>
                </Field>
              )}

              {mode === "reset" && resetStage === "confirm" && (
                <>
                  <Field icon={<KeyRound className="h-4 w-4" />} label={tt("auth.resetCode", "Reset Code")}>
                    <input required value={token} onChange={(e) => setToken(e.target.value)} placeholder="6-char code" className={`${inputCls} mono uppercase tracking-widest`} />
                  </Field>
                  <Field icon={<KeyRound className="h-4 w-4" />} label={tt("auth.newPassword", "New Password")}>
                    <input required type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className={inputCls} />
                  </Field>
                </>
              )}

              {err && <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-700">{err}</div>}
              {ok && <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">{ok}</div>}

              <button
                type="submit"
                disabled={busy}
                className="mono inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-foreground shadow-sm shadow-amber/30 transition-all hover:brightness-95 disabled:opacity-60"
              >
                {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {tt("auth.processing", "Processing…")}</> :
                  mode === "login" ? tt("auth.signIn", "Sign In") :
                  mode === "signup" ? tt("auth.createAccount", "Create Account") :
                  resetStage === "request" ? tt("auth.requestCode", "Request Code") : tt("auth.commitReset", "Reset Password")}
              </button>

              {mode === "login" && (
                <div className="mono flex items-center justify-between text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  <button type="button" onClick={() => { setMode("reset"); setErr(null); setOk(null); }} className="hover:text-foreground">
                    {tt("auth.forgot", "Forgot password?")}
                  </button>
                  <button type="button" onClick={() => { setMode("signup"); setErr(null); setOk(null); }} className="text-amber hover:underline">
                    {tt("auth.newOperator", "Create operator →")}
                  </button>
                </div>
              )}
              {mode !== "login" && (
                <button type="button" onClick={() => { setMode("login"); setErr(null); setOk(null); }} className="mono inline-flex items-center gap-1 text-[10.5px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3 w-3" /> {tt("auth.backLogin", "Back to sign in")}
                </button>
              )}
            </form>

            <p className="mono mt-4 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {tt("auth.mockNotice", "Mock authentication · local device only")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30";

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mono mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </div>
      {children}
    </label>
  );
}
