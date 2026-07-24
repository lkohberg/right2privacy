import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, KeyRound, Send, ShieldCheck, Flame, Scale } from "lucide-react";

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
          Discord, SMS, email — anything. Only the friend you chose can
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
            key never leaves your device unencrypted — an optional
            password-encrypted backup is stored so you can restore on another
            device.
          </p>
        </div>
      </section>

      <section id="motivation" className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-destructive">
            <Flame className="h-4 w-4" /> Motivation
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Chat Control is a surveillance regime dressed up as child safety.
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              The European Union — the same institution that lectures the world
              about human rights — is trying to force every messenger on the
              continent to scan your private conversations before they are even
              encrypted. They call it "Chat Control." Strip away the PR and it
              is a mandatory wiretap on 450 million people. Every message,
              every photo, every voice note, pre-screened by an algorithm that
              answers to a bureaucrat you never voted for.
            </p>
            <p>
              They wave dead children in your face to sell it, because they
              know no honest argument survives ten seconds of scrutiny.
              Mass-scanning does not catch predators — predators already use
              tools this law cannot touch. It catches <em>you</em>. Your
              medical photos. Your union chat. Your affair. Your therapy
              venting. Your jokes taken out of context by a model with a 90%
              false-positive rate, forwarded to a stranger in an office, and
              archived forever.
            </p>
            <p>
              A government that demands the right to read every private
              sentence before it is spoken is not a democracy with a security
              problem. It is an authoritarian project with a marketing
              department. The Stasi kept paper files on a third of East
              Germany and were considered monstrous for it. Brussels wants
              real-time client-side scanning on everyone, and calls it
              progress.
            </p>
            <p>
              Right2Privacy exists because we refuse. The math does not care
              about your directive. AES-GCM does not negotiate with a
              commissioner. If the "legal" messengers are compromised by
              decree, we will encrypt on top of them, underneath them, around
              them — until the wiretap sees nothing but noise. Paste the
              ciphertext into WhatsApp, into Signal, into a postcard if you
              have to. Let them scan it. Let them choke on it.
            </p>
            <p className="text-foreground">
              Privacy is not a loophole for criminals. It is the precondition
              for every other freedom you still have left. Defend it, or admit
              you never really wanted it.
            </p>
          </div>
        </div>
      </section>

      <section id="legal" className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Scale className="h-4 w-4 text-primary" /> Legal
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">No warranty.</span>{" "}
              Right2Privacy is provided "as is", without warranty of any kind,
              express or implied, including but not limited to fitness for a
              particular purpose, security, or non-infringement. You use it at
              your own risk.
            </p>
            <p>
              <span className="font-medium text-foreground">Acceptable use.</span>{" "}
              This service is a tool for private communication between
              consenting adults. Do not use it to plan, incite, or carry out
              acts that are illegal in your jurisdiction. We cannot see your
              messages and we cannot police them; that responsibility is
              yours.
            </p>
            <p>
              <span className="font-medium text-foreground">Data we hold.</span>{" "}
              Your email, a handle, your RSA public key, and an
              encrypted-at-rest backup of your private key that only your
              password can unlock. Wrapped per-message keys are relayed to the
              recipient and deleted on first fetch. We never see plaintext,
              session keys, or your password.
            </p>
            <p>
              <span className="font-medium text-foreground">Your rights (GDPR).</span>{" "}
              You can export or delete your account data at any time from
              Settings. Deleting your account destroys your key backup — old
              messages become permanently unreadable. That is a feature.
            </p>
            <p>
              <span className="font-medium text-foreground">Jurisdiction.</span>{" "}
              Right2Privacy takes no position on the legality of end-to-end
              encryption in any given country. Encryption is mathematics.
              Mathematics is speech. Speech is protected — for now.
            </p>
          </div>
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
