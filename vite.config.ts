import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Client-side Supabase only needs URL + anon key. Vite normally exposes only `VITE_*`;
 * we also read unprefixed names so Vercel can use `SUPABASE_URL` / `SUPABASE_ANON_KEY`.
 * (Never put the service_role key in any env var that ends up in this bundle.)
 */
function resolveSupabaseEnv(env: Record<string, string>) {
  const url =
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const anonKey =
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLIC_ANON_KEY ||
    '';
  const authRedirect = env.VITE_AUTH_REDIRECT_URL || env.AUTH_REDIRECT_URL || '';
  return { url, anonKey, authRedirect };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const { url, anonKey, authRedirect } = resolveSupabaseEnv(env);

  return {
    plugins: [react()],
    define: {
      __FOURSQ_SUPABASE_URL__: JSON.stringify(url),
      __FOURSQ_SUPABASE_ANON_KEY__: JSON.stringify(anonKey),
      __FOURSQ_AUTH_REDIRECT_URL__: JSON.stringify(authRedirect),
    },
  };
});
