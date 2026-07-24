import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { initProfile, getMyProfile } from "@/lib/friends.functions";
import {
  generateRsaKeypair,
  exportPublicKey,
  encryptPrivateKeyForBackup,
  decryptPrivateKeyFromBackup,
} from "@/lib/crypto";
import { savePrivateKey, loadPrivateKey } from "@/lib/keystore";
import { Lock } from "lucide-react";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional().default("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Right2Privacy" },
      {
        name: "description",
        content: "Sign in or create a Right2Privacy account.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const init = useServerFn(initProfile);
  const getProfile = useServerFn(getMyProfile);

  useEffect(() => setTab(mode), [mode]);

  // If already signed in and has a profile, jump to app.
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) navigate({ to: "/app" });
    })();
  }, [navigate]);

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (!/^[a-zA-Z0-9_]{3,32}$/.test(handle)) {
        throw new Error("Handle: 3–32 chars, letters/numbers/underscore.");
      }
      if (password.length < 8) throw new Error("Password must be at least 8 characters.");

      setStatus("Creating account…");
      const { data: signup, error: sErr } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (sErr) throw sErr;
      const userId = signup.user?.id;
      if (!userId) throw new Error("No user returned.");

      // Ensure we have a session (auto_confirm is enabled)
      if (!signup.session) {
        const { error: siErr } = await supabase.auth.signInWithPassword({ email, password });
        if (siErr) throw siErr;
      }

      setStatus("Generating your encryption keys…");
      const kp = await generateRsaKeypair();
      const publicKey = await exportPublicKey(kp.publicKey);
      const backup = await encryptPrivateKeyForBackup(kp.privateKey, password);

      setStatus("Saving profile…");
      await init({
        data: {
          handle: handle.toLowerCase(),
          public_key: publicKey,
          ...backup,
        },
      });

      await savePrivateKey(userId, kp.privateKey);
      navigate({ to: "/app" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      setStatus("Signing in…");
      const { data, error: sErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (sErr) throw sErr;
      const userId = data.user?.id;
      if (!userId) throw new Error("No user.");

      // Ensure private key is present locally; restore from backup if not.
      const existing = await loadPrivateKey(userId);
      if (!existing) {
        setStatus("Restoring your key from backup…");
        const profile = await getProfile();
        if (!profile) throw new Error("Profile missing.");
        try {
          const priv = await decryptPrivateKeyFromBackup(
            profile.encrypted_private_key,
            profile.pk_salt,
            profile.pk_iv,
            password,
          );
          await savePrivateKey(userId, priv);
        } catch {
          throw new Error(
            "Could not restore your encryption key. Wrong password?",
          );
        }
      }
      navigate({ to: "/app" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-6 py-16">
        <Link to="/" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <Lock className="h-4 w-4" /> Right2Privacy
        </Link>
        <h1 className="text-2xl font-semibold">
          {tab === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Privacy is a human right.
        </p>

        <div className="mt-6 flex gap-1 rounded-md border border-border p-1 text-sm">
          <button
            onClick={() => setTab("signin")}
            className={`flex-1 rounded-sm px-3 py-1.5 ${tab === "signin" ? "bg-accent" : ""}`}
          >
            Sign in
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 rounded-sm px-3 py-1.5 ${tab === "signup" ? "bg-accent" : ""}`}
          >
            Sign up
          </button>
        </div>

        <form
          onSubmit={tab === "signup" ? onSignUp : onSignIn}
          className="mt-6 space-y-4"
        >
          {tab === "signup" && (
            <Field label="Handle" hint="Others will add you by this handle.">
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                required
                minLength={3}
                maxLength={32}
                pattern="[a-zA-Z0-9_]+"
                className="input"
                placeholder="alice_"
              />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              autoComplete="email"
            />
          </Field>
          <Field
            label="Password"
            hint={
              tab === "signup"
                ? "Your password also unlocks your encrypted key backup. If you lose it, past messages become unreadable."
                : undefined
            }
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="input"
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
            />
          </Field>

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
              {error}
            </div>
          )}
          {status && !error && (
            <div className="text-sm text-muted-foreground">{status}</div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy
              ? "Working…"
              : tab === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: var(--color-input);
          color: var(--color-foreground);
          border: 1px solid var(--color-border);
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.9rem;
          outline: none;
        }
        .input:focus { border-color: var(--color-ring); }
      `}</style>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium">{label}</div>
      {children}
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </label>
  );
}