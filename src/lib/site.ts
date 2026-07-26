// Canonical public site. Auth emails must send people back here, never to a
// preview/lovable.dev URL.
export const SITE_URL = "https://right2privacy.at";

export function siteUrl(path = ""): string {
  const suffix = path.startsWith("/") ? path : path ? `/${path}` : "";
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith("right2privacy.at")) {
      return `${window.location.origin}${suffix}`;
    }
  }
  return `${SITE_URL}${suffix}`;
}