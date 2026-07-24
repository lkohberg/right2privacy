import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Users, Settings, LogOut } from "lucide-react";
import { clearPrivateKey } from "@/lib/keystore";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/friends.functions";
import { SUPPORTED_CODES } from "@/i18n/languages";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const { t, i18n } = useTranslation();

  const getProfile = useServerFn(getMyProfile);
  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
  });

  // Sync UI language to the saved profile language ONCE per session load.
  // After that, the user's active i18n.language wins so an in-app language
  // switch isn't immediately overwritten by a stale profile refetch.
  const syncedRef = useRef(false);
  useEffect(() => {
    if (syncedRef.current) return;
    const lng = profileQ.data?.language;
    if (lng && SUPPORTED_CODES.includes(lng)) {
      if (i18n.language !== lng) void i18n.changeLanguage(lng);
      syncedRef.current = true;
    }
  }, [profileQ.data?.language, i18n]);

  useEffect(() => {
    document.documentElement.lang = i18n.language || "en";
    const onChange = (l: string) => {
      document.documentElement.lang = l || "en";
    };
    i18n.on("languageChanged", onChange);
    return () => i18n.off("languageChanged", onChange);
  }, [i18n]);

  async function signOut() {
    if (user?.id) await clearPrivateKey(user.id).catch(() => {});
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link to="/app" className="flex items-center gap-2 text-sm font-mono">
            <Lock className="h-4 w-4 text-primary" /> Right2Privacy
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/app" label={t("nav_messages")} />
            <NavLink to="/friends" label={t("nav_friends")} icon={<Users className="h-4 w-4" />} />
            <NavLink to="/settings" label={t("nav_settings")} icon={<Settings className="h-4 w-4" />} />
            <button
              onClick={signOut}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent"
              title={t("nav_signout")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

function NavLink({
  to,
  label,
  icon,
}: {
  to: "/app" | "/friends" | "/settings";
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-accent"
      activeProps={{ className: "flex items-center gap-1.5 rounded-md px-3 py-1.5 bg-accent" }}
    >
      {icon}
      {label}
    </Link>
  );
}