import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { PRESET_TOKENS } from './src/theme/presets';
import { CSS_VAR_MAP, THEME_OVERRIDES_KEY, THEME_STUDIO_ENABLED_KEY } from './src/theme/designTokenTypes';

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

/**
 * Injects a tiny blocking script into <head> that reads the saved theme from
 * localStorage and applies all CSS custom properties synchronously — before
 * React ever renders — so there is zero flash of un-themed content.
 */
function themeInitPlugin() {
  return {
    name: 'inject-theme-init',
    transformIndexHtml(html: string) {
      const MAP = JSON.stringify(CSS_VAR_MAP);
      const PRESETS = JSON.stringify(PRESET_TOKENS);
      const THEME_MODE_KEY = '4sq-theme-mode';

      const script = `(function(){
try{
  var MAP=${MAP};
  var PRESETS=${PRESETS};
  var mode=localStorage.getItem('${THEME_MODE_KEY}')||'light';
  var enabled=localStorage.getItem('${THEME_STUDIO_ENABLED_KEY}')==='1';
  var overrides=enabled?JSON.parse(localStorage.getItem('${THEME_OVERRIDES_KEY}')||'{}'):{};
  var preset=PRESETS[mode]||PRESETS['light'];
  var tokens=Object.assign({},preset,overrides);
  var root=document.documentElement;
  Object.keys(MAP).forEach(function(k){if(tokens[k])root.style.setProperty(MAP[k],tokens[k]);});
}catch(e){}
})();`;

      return html.replace('<head>', `<head>\n    <script>${script}</script>`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const { url, anonKey, authRedirect } = resolveSupabaseEnv(env);

  return {
    plugins: [react(), themeInitPlugin()],
    define: {
      __FOURSQ_SUPABASE_URL__: JSON.stringify(url),
      __FOURSQ_SUPABASE_ANON_KEY__: JSON.stringify(anonKey),
      __FOURSQ_AUTH_REDIRECT_URL__: JSON.stringify(authRedirect),
    },
  };
});
