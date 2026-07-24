import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateLanguage } from "@/lib/friends.functions";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { loadPrivateKey } from "@/lib/keystore";
import { useTranslation } from "react-i18next";
import { LANGUAGES, SUPPORTED_CODES } from "@/i18n/languages";
import { i18n as i18nInstance } from "@/i18n";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Right2Privacy" },
      { name: "description", content: "Your Right2Privacy account." },
      { property: "og:title", content: "Settings — Right2Privacy" },
      { property: "og:description", content: "Your Right2Privacy account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Settings — Right2Privacy" },
      { name: "twitter:description", content: "Your Right2Privacy account." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();
  const i18n = i18nInstance;
  const getProfile = useServerFn(getMyProfile);
  const setLangFn = useServerFn(updateLanguage);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const [email, setEmail] = useState<string | null>(null);
  const [hasLocalKey, setHasLocalKey] = useState<boolean | null>(null);
  const [savingLng, setSavingLng] = useState<string | null>(null);
  const [savedLng, setSavedLng] = useState(false);
  const [langError, setLangError] = useState<string | null>(null);
  const [selectedLng, setSelectedLng] = useState<string | null>(null);

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

  async function onChangeLanguage(code: string) {
    if (!SUPPORTED_CODES.includes(code)) return;
    setSelectedLng(code); // optimistic — dropdown reflects choice immediately
    setSavingLng(code);
    setSavedLng(false);
    setLangError(null);
    // Change UI language immediately so all strings update while we save.
    await i18n.changeLanguage(code);
    try {
      await setLangFn({ data: { language: code } });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      setSavedLng(true);
      setTimeout(() => setSavedLng(false), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLangError(msg);
    } finally {
      setSavingLng(null);
    }
  }

  const currentLng =
    selectedLng ?? q.data?.language ?? i18n.language ?? "en";

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-semibold">{t("settings_title")}</h1>
      <div className="mt-6 space-y-4">
        <Card title={t("settings_account")}>
          <Row label={t("settings_email")}>{email ?? "—"}</Row>
          <Row label={t("settings_handle")}>
            {q.data ? <span className="font-mono">@{q.data.handle}</span> : "—"}
          </Row>
        </Card>

        <Card title={t("settings_language")}>
          <div className="px-4 py-3">
            <select
              value={currentLng}
              onChange={(e) => onChangeLanguage(e.target.value)}
              disabled={savingLng !== null}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              style={{
                background: "var(--color-input)",
                color: "var(--color-foreground)",
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} — {l.englishName}
                </option>
              ))}
            </select>
            <div className="mt-2 min-h-[1.25rem] text-xs text-muted-foreground">
              {savingLng
                ? t("settings_saving")
                : savedLng
                  ? t("settings_saved")
                  : ""}
            </div>
            {langError && (
              <div className="mt-1 text-xs text-destructive">{langError}</div>
            )}
          </div>
        </Card>

        <Card title={t("settings_encryption")}>
          <Row label={t("settings_priv_local")}>
            {hasLocalKey === null
              ? "…"
              : hasLocalKey
                ? t("settings_present")
                : t("settings_missing")}
          </Row>
          <Row label={t("settings_backup")}>
            {q.data?.encrypted_private_key
              ? t("settings_present")
              : t("settings_missing")}
          </Row>
          <p className="px-4 pb-4 text-xs text-muted-foreground">
            {t("settings_priv_note")}
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