import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import "@/i18n";
import {
  listFriends,
  searchByHandle,
  sendFriendRequest,
  respondFriendRequest,
  unfriend,
} from "@/lib/friends.functions";
import { Check, X, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/friends")({
  head: () => ({
    meta: [
      { title: "Friends — Right2Privacy" },
      { name: "description", content: "Manage your Right2Privacy friends." },
    ],
  }),
  component: FriendsPage,
});

function FriendsPage() {
  const { t } = useTranslation();
  const listFn = useServerFn(listFriends);
  const searchFn = useServerFn(searchByHandle);
  const sendFn = useServerFn(sendFriendRequest);
  const respondFn = useServerFn(respondFriendRequest);
  const unfriendFn = useServerFn(unfriend);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["friends"], queryFn: () => listFn() });

  const [handle, setHandle] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const clean = handle.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,32}$/.test(clean)) throw new Error(t("friends_err_invalid"));
      const found = await searchFn({ data: { handle: clean } });
      if (!found) throw new Error(t("friends_err_no_user"));
      const res = await sendFn({ data: { addressee_id: found.id } });
      setMsg(
        res.autoAccepted
          ? t("friends_now_friends", { handle: found.handle })
          : t("friends_request_sent", { handle: found.handle }),
      );
      setHandle("");
      qc.invalidateQueries({ queryKey: ["friends"] });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const rows = q.data ?? [];
  const incoming = rows.filter(
    (r) => r.status === "pending" && r.direction === "incoming",
  );
  const outgoing = rows.filter(
    (r) => r.status === "pending" && r.direction === "outgoing",
  );
  const accepted = rows.filter((r) => r.status === "accepted");

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-semibold">{t("friends_title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("friends_intro")}
      </p>

      <form onSubmit={onAdd} className="mt-6 flex gap-2">
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder={t("friends_handle_ph")}
          className="r2p-input flex-1"
        />
        <button
          disabled={busy}
          className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" /> {t("friends_add")}
        </button>
      </form>
      {msg && <div className="mt-2 text-sm text-muted-foreground">{msg}</div>}

      <Section title={t("friends_incoming")} hint={incoming.length === 0 ? t("friends_none") : undefined}>
        {incoming.map((r) => (
          <Row key={r.friendship_id}>
            <span>@{r.other.handle}</span>
            <div className="flex gap-1">
              <IconBtn
                title={t("app_encrypt_btn").length > 0 ? t("friends_add") : "Accept"}
                onClick={async () => {
                  await respondFn({
                    data: { friendship_id: r.friendship_id, accept: true },
                  });
                  qc.invalidateQueries({ queryKey: ["friends"] });
                }}
              >
                <Check className="h-4 w-4" />
              </IconBtn>
              <IconBtn
                title={t("friends_none")}
                onClick={async () => {
                  await respondFn({
                    data: { friendship_id: r.friendship_id, accept: false },
                  });
                  qc.invalidateQueries({ queryKey: ["friends"] });
                }}
              >
                <X className="h-4 w-4" />
              </IconBtn>
            </div>
          </Row>
        ))}
      </Section>

      <Section title={t("friends_outgoing")} hint={outgoing.length === 0 ? t("friends_none") : undefined}>
        {outgoing.map((r) => (
          <Row key={r.friendship_id}>
            <span className="text-muted-foreground">@{r.other.handle} · {t("friends_waiting")}</span>
            <IconBtn
              title={t("friends_none")}
              onClick={async () => {
                await unfriendFn({ data: { friendship_id: r.friendship_id } });
                qc.invalidateQueries({ queryKey: ["friends"] });
              }}
            >
              <X className="h-4 w-4" />
            </IconBtn>
          </Row>
        ))}
      </Section>

      <Section title={t("friends_list")} hint={accepted.length === 0 ? t("friends_none_yet") : undefined}>
        {accepted.map((r) => (
          <Row key={r.friendship_id}>
            <span>@{r.other.handle}</span>
            <IconBtn
              title={t("friends_none")}
              onClick={async () => {
                if (!confirm(t("friends_confirm_unfriend", { handle: r.other.handle }))) return;
                await unfriendFn({ data: { friendship_id: r.friendship_id } });
                qc.invalidateQueries({ queryKey: ["friends"] });
              }}
            >
              <X className="h-4 w-4" />
            </IconBtn>
          </Row>
        ))}
      </Section>

      <style>{`
        .r2p-input {
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
    </main>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="mt-2 divide-y divide-border rounded-md border border-border bg-card">
        {hint ? (
          <div className="px-4 py-3 text-sm text-muted-foreground">{hint}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      {children}
    </div>
  );
}

function IconBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void | Promise<void>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-md border border-border p-1.5 hover:bg-accent"
    >
      {children}
    </button>
  );
}