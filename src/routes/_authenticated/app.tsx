import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listFriends } from "@/lib/friends.functions";
import { postWrappedKey, fetchWrappedKey } from "@/lib/keys.functions";
import { encryptMessage, decryptMessage, parseBlob } from "@/lib/crypto";
import { loadPrivateKey } from "@/lib/keystore";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Check, Lock, Unlock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Messages — Right2Privacy" },
      { name: "description", content: "Encrypt and decrypt messages." },
    ],
  }),
  component: Workspace,
});

type Friend = {
  friendship_id: string;
  status: "pending" | "accepted";
  direction: "incoming" | "outgoing";
  other: { id: string; handle: string; public_key: string };
};

function Workspace() {
  const [tab, setTab] = useState<"encrypt" | "decrypt">("encrypt");
  const listFriendsFn = useServerFn(listFriends);
  const friendsQ = useQuery({
    queryKey: ["friends"],
    queryFn: () => listFriendsFn(),
  });
  const accepted = ((friendsQ.data ?? []) as Friend[]).filter(
    (f) => f.status === "accepted",
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex gap-1 rounded-md border border-border p-1 text-sm">
        <button
          onClick={() => setTab("encrypt")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-sm px-3 py-2 ${tab === "encrypt" ? "bg-accent" : ""}`}
        >
          <Lock className="h-4 w-4" /> Encrypt
        </button>
        <button
          onClick={() => setTab("decrypt")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-sm px-3 py-2 ${tab === "decrypt" ? "bg-accent" : ""}`}
        >
          <Unlock className="h-4 w-4" /> Decrypt
        </button>
      </div>

      {friendsQ.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading friends…</div>
      ) : accepted.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-6 text-sm text-muted-foreground">
          You have no accepted friends yet. Head to <span className="text-foreground">Friends</span> to add one by their handle.
        </div>
      ) : tab === "encrypt" ? (
        <EncryptPanel friends={accepted} />
      ) : (
        <DecryptPanel friends={accepted} />
      )}

      <FieldStyles />
    </main>
  );
}

function EncryptPanel({ friends }: { friends: Friend[] }) {
  const [recipientId, setRecipientId] = useState(friends[0]?.other.id ?? "");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const postKey = useServerFn(postWrappedKey);

  useEffect(() => {
    if (!recipientId && friends[0]) setRecipientId(friends[0].other.id);
  }, [friends, recipientId]);

  async function onEncrypt() {
    setError(null);
    setOutput(null);
    setBusy(true);
    try {
      const recipient = friends.find((f) => f.other.id === recipientId);
      if (!recipient) throw new Error("Pick a recipient.");
      if (!recipient.other.public_key) throw new Error("Missing recipient key.");
      if (!text.trim()) throw new Error("Type a message first.");

      const { blob, wrappedKey, messageId } = await encryptMessage(
        text,
        recipient.other.public_key,
      );
      await postKey({
        data: {
          message_id: messageId,
          recipient_id: recipient.other.id,
          wrapped_key: wrappedKey,
        },
      });
      setOutput(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function copyOut() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <Field label="Recipient">
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className="r2p-input"
        >
          {friends.map((f) => (
            <option key={f.other.id} value={f.other.id}>
              @{f.other.handle}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Message">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="r2p-input"
          placeholder="Type the message to encrypt…"
        />
      </Field>
      <button
        onClick={onEncrypt}
        disabled={busy}
        className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Encrypting…" : "Encrypt & send key"}
      </button>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {output && (
        <div className="rounded-md border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Ciphertext — paste this anywhere</span>
            <button
              onClick={copyOut}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-accent"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="max-h-60 overflow-auto font-mono text-xs break-all">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}

function DecryptPanel({ friends }: { friends: Friend[] }) {
  const [senderId, setSenderId] = useState(friends[0]?.other.id ?? "");
  const [blob, setBlob] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const fetchKey = useServerFn(fetchWrappedKey);

  useEffect(() => {
    if (!senderId && friends[0]) setSenderId(friends[0].other.id);
  }, [friends, senderId]);

  async function onDecrypt() {
    setError(null);
    setOutput(null);
    setBusy(true);
    try {
      const parsed = parseBlob(blob);
      const key = await fetchKey({
        data: { message_id: parsed.mid, sender_id: senderId },
      });
      if (!key) throw new Error("No key found for this message from that sender.");
      const { data: udata } = await supabase.auth.getUser();
      if (!udata.user) throw new Error("Signed out.");
      const priv = await loadPrivateKey(udata.user.id);
      if (!priv) throw new Error("Your private key is missing on this device.");
      const pt = await decryptMessage(parsed, key.wrapped_key, priv);
      setOutput(pt);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Field label="Sender">
        <select
          value={senderId}
          onChange={(e) => setSenderId(e.target.value)}
          className="r2p-input"
        >
          {friends.map((f) => (
            <option key={f.other.id} value={f.other.id}>
              @{f.other.handle}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Ciphertext blob">
        <textarea
          value={blob}
          onChange={(e) => setBlob(e.target.value)}
          rows={5}
          className="r2p-input font-mono text-xs"
          placeholder="Paste the R2P:… blob you received"
        />
      </Field>
      <button
        onClick={onDecrypt}
        disabled={busy}
        className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Decrypting…" : "Decrypt"}
      </button>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {output && (
        <div className="rounded-md border border-border bg-card p-4">
          <div className="mb-2 text-xs text-muted-foreground">Plaintext</div>
          <div className="whitespace-pre-wrap text-sm">{output}</div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium">{label}</div>
      {children}
    </label>
  );
}

function FieldStyles() {
  return (
    <style>{`
      .r2p-input {
        width: 100%;
        background: var(--color-input);
        color: var(--color-foreground);
        border: 1px solid var(--color-border);
        border-radius: 0.375rem;
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
        outline: none;
      }
      .r2p-input:focus { border-color: var(--color-ring); }
    `}</style>
  );
}