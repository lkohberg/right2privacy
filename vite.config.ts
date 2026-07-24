// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";
import path from "path";

// Load non-VITE_ env vars (e.g. SUPABASE_SERVICE_ROLE_KEY, LOVABLE_API_KEY) into process.env
// so server routes can read them. VITE_* vars are still injected for client code by the
// Lovable TanStack config; we do NOT add server env to `define` to avoid leaking secrets.
const loadServerEnvPlugin = () => ({
  name: "load-server-env",
  config: (_config: unknown, { mode }: { mode: string }) => {
    const serverEnv = loadEnv(mode, process.cwd(), "");
    Object.assign(process.env, serverEnv);
    return {};
  },
});

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [loadServerEnvPlugin()],
    resolve: {
      alias: {
        // React Email's htmlparser2 needs entities v4.5.0; pin every import path to the
        // hoisted copy so nested v7+ copies (which removed ./lib/decode.js) are not used.
        "entities/lib/decode.js": path.resolve(
          process.cwd(),
          "node_modules/entities/lib/decode.js",
        ),
        "entities/lib/encode.js": path.resolve(
          process.cwd(),
          "node_modules/entities/lib/encode.js",
        ),
        entities: path.resolve(process.cwd(), "node_modules/entities"),
      },
    },
  },
});
