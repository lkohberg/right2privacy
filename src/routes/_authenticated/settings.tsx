import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/friends.functions";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { loadPrivateKey } from "@/lib/keystore";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Right2Privacy" },
      { name: "description", content: "Your Right2Privacy account." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const getProfile = useServerFn(getMyProfile);
  const q = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const [email, setEmail] = useState<string | null>(null);
  const [hasLocalKey, setHasLocalKey] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      if (data.user) {
        const k = await loadPrivateKey(data.user.id);
        setHasLocalKey(!!k);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="mt-6 space-y-4">
        <Card title="Account">
          <Row label="Email">{email ?? "—"}</Row>
          <Row label="Handle">
            {q.data ? <span className="font-mono">@{q.data.handle}</span> : "—"}
          </Row>
        </Card>
        <Card title="Encryption">
          <Row label="Private key on this device">
            {hasLocalKey === null ? "…" : hasLocalKey ? "Present" : "Missing"}
          </Row>
          <Row label="Encrypted backup on server">
            {q.data?.encrypted_private_key ? "Present" : "Missing"}
          </Row>
          <p className="px-4 pb-4 text-xs text-muted-foreground">
            Your private key never leaves your device unencrypted. Your password
            unlocks the backup — if you forget it, past messages cannot be
            recovered.
          </p>
        </Card>
      </div>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="border-b border-border px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{children}</span>
    </div>
  );
}