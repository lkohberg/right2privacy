import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, KeyRound, Send, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Right2Privacy" },
      {
        name: "description",
        content:
          "End-to-end encrypt messages in your browser, then send the ciphertext through any messenger. Privacy is a human right.",
      },
      { property: "og:title", content: "Right2Privacy" },
      {
        property: "og:description",
        content:
          "End-to-end encrypt messages in your browser, then send the ciphertext through any messenger. Privacy is a human right.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <span className="font-mono text-sm tracking-tight">Right2Privacy</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            to="/auth"
            className="rounded-md border border-border px-3 py-1.5 hover:bg-accent"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" as const }}
            className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90"
          >
            Create account
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-16 pb-10 text-center">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Right<span className="text-primary">2</span>Privacy
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Privacy is a human right.
        </p>
        <p className="mx-auto mt-8 max-w-xl text-base text-muted-foreground">
          Encrypt any message in your browser. Paste the ciphertext into
          Discord, SMS, email, anything. Only the friend you chose can
          decrypt it. We never see the plaintext or your keys.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/auth"
            search={{ mode: "signup" as const }}
            className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
          >
            Get started
          </Link>
          <Link
            to="/auth"
            className="rounded-md border border-border px-5 py-2.5 font-medium hover:bg-accent"
          >
            I have an account
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 py-16 sm:grid-cols-3">
        <Step
          icon={<KeyRound className="h-5 w-5 text-primary" />}
          title="1. Add a friend"
          body="Find them by their handle. Once they accept, their public key lives in your friends list."
        />
        <Step
          icon={<Lock className="h-5 w-5 text-primary" />}
          title="2. Encrypt in browser"
          body="Type your message and pick a friend. You get a ciphertext blob and the key travels to them privately."
        />
        <Step
          icon={<Send className="h-5 w-5 text-primary" />}
          title="3. Send it anywhere"
          body="Paste the blob into any messenger. Your friend pastes it back into Right2Privacy to decrypt."
        />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> How the crypto works
          </div>
          <p className="text-sm text-muted-foreground">
            RSA-OAEP 2048 identity keys, AES-GCM 256 per-message keys. All
            crypto runs in your browser via the Web Crypto API. Your private
            key never leaves your device unencrypted, an optional
            password-encrypted backup is stored so you can restore on another
            device.
          </p>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Right2Privacy · Privacy is a human right.
      </footer>
    </main>
  );
}

function Step({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3">{icon}</div>
      <div className="font-medium">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
