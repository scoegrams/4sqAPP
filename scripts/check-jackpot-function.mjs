#!/usr/bin/env node
/**
 * Probes the deployed `jackpot-pin` Edge Function (OPTIONS preflight).
 * Uses the same Supabase URL as the Vite app (.env).
 *
 * Run: npm run check:jackpot-fn
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const root = resolve(__dirname, '..');
const env = loadEnvFile(resolve(root, '.env'));
const url = (
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
)
  .trim()
  .replace(/\/$/, '');

const linkRefPath = resolve(root, 'supabase', '.temp', 'project-ref');
const linked = existsSync(linkRefPath) ? readFileSync(linkRefPath, 'utf8').trim() : '';

console.log('Jackpot Edge Function check\n');

if (!url) {
  console.error('❌ No Supabase URL in .env (SUPABASE_URL or VITE_SUPABASE_URL).');
  process.exit(1);
}

const host = (() => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
})();
const refMatch = host.match(/^([a-z0-9]+)\.supabase\.co$/i);
const inferredRef = refMatch ? refMatch[1] : '(unknown)';

console.log('Project URL:', url);
console.log('Inferred project ref:', inferredRef);

if (!linked) {
  console.warn('\n⚠️  CLI not linked to a project (missing supabase/.temp/project-ref).');
  console.warn('   Deploy will fail until you run:');
  console.warn(`   supabase link --project-ref ${inferredRef !== '(unknown)' ? inferredRef : 'YOUR_REF'}`);
} else {
  console.log('Linked CLI ref:       ', linked);
  if (inferredRef !== '(unknown)' && linked !== inferredRef) {
    console.warn('\n⚠️  .env URL ref ≠ linked ref — deploy may be going to a different project than the app!');
  }
}

const fnUrl = `${url}/functions/v1/jackpot-pin`;
console.log('\nProbing OPTIONS (CORS preflight):', fnUrl);

let res;
try {
  res = await fetch(fnUrl, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://4sq-app.vercel.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,apikey,content-type,x-client-info',
    },
  });
} catch (e) {
  console.error('❌ Network error:', e.message);
  process.exit(1);
}

const status = res.status;
console.log('HTTP status:', status);

if (status === 404) {
  console.error('\n❌ 404 — `jackpot-pin` is NOT deployed on this Supabase project.');
  console.error('   Fix: from repo root (after supabase link):');
  console.error('   npm run deploy:jackpot-pin');
  process.exit(1);
}

if (status === 401 || status === 403) {
  console.error('\n❌', status, '— JWT verification is probably ON for this function.');
  console.error('   Fix: supabase functions deploy jackpot-pin --no-verify-jwt');
  console.error('   Or Dashboard → Edge Functions → jackpot-pin → turn Verify JWT OFF.');
  process.exit(1);
}

if (status >= 200 && status < 300) {
  console.log('\n✅ Preflight OK — function exists and OPTIONS returned 2xx.');
  process.exit(0);
}

console.error('\n❌ Unexpected status — check Supabase status / function logs.');
process.exit(1);
